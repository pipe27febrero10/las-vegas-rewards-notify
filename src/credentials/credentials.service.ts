import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import { Credential } from './dtos/credential.dto';
import { ICredentialsRepository } from './interfaces/credentials-repository.interface';
import { DateTime } from 'luxon';
import axios from 'axios';

@Injectable()
export class CredentialsService {
    private username = '';
    private password = '';
    private facebookOauthEndpoint = '';
    private urlGamePage = '';
    private urlSessionPage = '';
    private headersSessionToken = {
      headers: {
      }
    }

    constructor(private readonly configService : ConfigService, @Inject('ICredentialsRepository') private readonly credentialRepository : ICredentialsRepository){
      this.username = this.configService.get('USER_FACEBOOK');
      this.password = this.configService.get('PASS_FACEBOOK');
      this.facebookOauthEndpoint = this.configService.get('FACEBOOK_OAUTH_ENDPOINT');
      this.urlGamePage = this.configService.get('URL_GAME_PAGE');
      this.urlSessionPage = this.configService.get('URL_SESSION_PAGE');

      // this.headersSessionToken.headers = { 
      //     'Accept': '*/*', 
      //     'Accept-Language': 'es-419,es;q=0.9', 
      //     'Accept-Type': 'application/json', 
      //     'Authorization': 'Psa 5Gs28B9YGRMhmuijQiV1KdJaP861rMob/kNK62QWPv4=', 
      //     'X-AVA-DAB': '3_25_0', 
      //     'X-Adjust-ID': '', 
      //     'X-Client-Version': '3.25.0.1379', 
      //     'X-Device-Ad-ID': 'd19d4a47-a329-4285-8514-c62c607a5fc4', 
      //     'X-Device-ID': '9f9515f3-6f75-48f7-9c03-62fc7bb7cde1', 
      //     'X-Device-ID-Actual': '9f9515f3-6f75-48f7-9c03-62fc7bb7cde1', 
      //     'X-Device-Type': 'Desktop', 
      //     'X-Install-Source': '', 
      //     'X-Operating-System-Name': 'Windows 10', 
      //     'X-PSA-ID': '8543403', 
      //     'X-Platform-Type': 'WebGL', 
      //     'X-Store-Type': 'WebGL', 
      //     'Content-Type': 'text/plain'
      //   };


      this.headersSessionToken.headers = {
        'Accept': '*/*', 
        'Accept-Language': 'es-419,es;q=0.9', 
        'Accept-Type': 'application/json', 
        'Authorization': 'Psa CiJmsYju4kIuvfUqEDwgUDBHtfaJLMbHSHLpx23tCqs=', 
        'Connection': 'keep-alive', 
        'Content-Type': 'application/json', 
        'Origin': 'https://www.myvegas.com', 
        'Referer': 'https://www.myvegas.com/', 
        'Sec-Fetch-Dest': 'empty', 
        'Sec-Fetch-Mode': 'cors', 
        'Sec-Fetch-Site': 'cross-site', 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36', 
        'X-AVA-DAB': '3_26_0', 
        'X-Adjust-ID': '', 
        'X-Client-Version': '3.26.0.1440', 
        'X-Device-Ad-ID': '716487a9-0508-4f9e-a62d-bb87ce630127', 
        'X-Device-ID': '85549c44-292c-4bf9-a8ae-660b8dd8e68b', 
        'X-Device-ID-Actual': '85549c44-292c-4bf9-a8ae-660b8dd8e68b', 
        'X-Device-Type': 'Desktop', 
        'X-Fb-Access-Token': 'EAACPY2UeMGgBADHhcwpCvlGavD2wuLYOwsBi8KVe09SS5IZCSoUTZCPjhZATxcp4lWK09SKugW4mJuJKLJUUg4sX56hx9vZCHNHZB5WbeOutBo3F729edHZBSyWLgXZCHESHlGVNH0CzR05Q31iBP3cc1JlfAKZA2lZAuBZCl2A4YzwGERtDABp1sqgLLnPFU4pmuDdsCZBzbUvWuS94pwqeven', 
        'X-Install-Source': '', 
        'X-Operating-System-Name': 'Windows 10', 
        'X-PSA-ID': '8539844', 
        'X-Platform-Type': 'WebGL', 
        'X-Store-Type': 'WebGL', 
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"', 
        'sec-ch-ua-mobile': '?0', 
        'sec-ch-ua-platform': '"Windows"', 
        'traceparent': '00-85d411d4a858fa8f6a774f7c61891cdf-e6ef16b48252ff6d-00'
      }


    }

    async getAccessToken() : Promise<string> {
      try{
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(this.facebookOauthEndpoint);
        await page.waitForSelector('#email');
        await page.$eval('#email', (el,username) => {
          const element = el as any;
          element.value = username;
        },this.username);
        await page.$eval('#pass', (el,password) => {
          const element = el as any;
          element.value = password;
        },this.password);
        await page.evaluate(selector => document.querySelector(selector).click(), 'input[value="Log In"],#loginbutton');
        await page.waitForTimeout(1000);
        const lasVegasPage = await browser.newPage();
        await lasVegasPage.goto(this.urlGamePage);
        await lasVegasPage.waitForSelector('#loginbutton');
        await lasVegasPage.evaluate(selector => document.querySelector(selector).click(), '#loginbutton');
        await lasVegasPage.waitForSelector('#logoutbutton')
        await page.waitForTimeout(1000);
        const sessionStorageLasVegasPage = await lasVegasPage.evaluate(() =>  Object.assign({}, window.sessionStorage));
        const accessToken = JSON.parse(sessionStorageLasVegasPage.fbssls_157657061011560)?.authResponse?.accessToken || '';
        console.log('aqui viene el access token: ',sessionStorageLasVegasPage);
        browser.close();
        return accessToken;
      }
      catch(err)
      {
        throw new Error('Error getting access token');
      }
    }

    async getSessionToken(token? : string) : Promise<string> {
      try{
        const accessToken = token ? token : await this.getLastAccessToken();
        this.setAccessToken(accessToken);
        const response = await axios.post(this.urlSessionPage,{},this.headersSessionToken);
        const vegasAccessToken = response.data?.AccessToken;
        return vegasAccessToken || '';
      }
      catch(err)
      {
        throw new Error('Error getting session token');
      }
    }

    setAccessToken(accessToken: string) : void
    { 
      this.headersSessionToken.headers['X-Fb-Access-Token'] = accessToken;
    }

    async createAccessToken(accessToken: string,expirationInMinutes: number) : Promise<Credential> {
      const now = DateTime.utc().toISO();
      const expiresAt = DateTime.fromISO(now).plus({ minutes: expirationInMinutes }).toISO();
      return this.credentialRepository.saveCredential({
        accessToken,
        expiresAt
      });
    }

    async getLastAccessToken() : Promise<string> {
      return this.credentialRepository.getLastCredential()?.accessToken || '';
    }

    async getLastCredential() : Promise<Credential> {
      return this.credentialRepository.getLastCredential();
    }
}