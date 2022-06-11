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
    private psaAuthorizationSessionToken = '';
    private psaId = '';

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
      this.psaAuthorizationSessionToken = this.configService.get('PSA_AUTHORIZATION_SESSION_TOKEN');
      this.psaId = this.configService.get('PSA_ID');

      this.headersSessionToken.headers = { 
          'Authorization': this.psaAuthorizationSessionToken, 
          'X-AVA-DAB': '3_25_0', 
          'X-Adjust-ID': '', 
          'X-Client-Version': '3.25.0.1379', 
          'X-Device-Ad-ID': 'd19d4a47-a329-4285-8514-c62c607a5fc4', 
          'X-Device-ID': '9f9515f3-6f75-48f7-9c03-62fc7bb7cde1', 
          'X-Device-ID-Actual': '9f9515f3-6f75-48f7-9c03-62fc7bb7cde1', 
          'X-Device-Type': 'Desktop', 
          'X-Install-Source': '', 
          'X-Operating-System-Name': 'Windows 10', 
          'X-PSA-ID': this.psaId, 
          'X-Platform-Type': 'WebGL', 
          'X-Store-Type': 'WebGL'
        };
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