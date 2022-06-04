import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import { Credential } from './dtos/credential.dto';
import { ICredentialsRepository } from './interfaces/credentials-repository.interface';

@Injectable()
export class CredentialsService {
    private username = '';
    private password = '';
    private facebookOauthEndpoint = '';
    private urlGamePage = '';

    constructor(private readonly configService : ConfigService, @Inject('ICredentialsRepository') private readonly credentialRepository : ICredentialsRepository){
      this.username = this.configService.get('USER_FACEBOOK');
      this.password = this.configService.get('PASS_FACEBOOK');
      this.facebookOauthEndpoint = this.configService.get('FACEBOOK_OAUTH_ENDPOINT');
      this.urlGamePage = this.configService.get('URL_GAME_PAGE');
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
        return accessToken;
      }
      catch(err)
      {
        throw new Error('Error getting access token');
      }
    }

    async createAccessToken(accessToken: string) : Promise<Credential> {
      return this.credentialRepository.saveCredential({
        accessToken
      })
    }

    async getLastAccessToken() : Promise<string> {
      return this.credentialRepository.getLastCredential()?.accessToken || '';
    }
}