import { CredentialDTO, Credential } from "../dtos/credential.dto";

export interface ICredentialsRepository{
    getLastCredential(): Credential;
    saveCredential(credential: CredentialDTO): Credential;
}