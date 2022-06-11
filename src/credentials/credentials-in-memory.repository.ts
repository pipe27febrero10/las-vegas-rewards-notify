import { Injectable } from '@nestjs/common';
import { Credential, CredentialDTO } from './dtos/credential.dto';
import { ICredentialsRepository } from './interfaces/credentials-repository.interface';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CredentialsRepositoryInMemory implements ICredentialsRepository {
    private credentials: Credential[] = [];
    constructor() { }
    getLastCredential(): Credential {
        return this.credentials.length > 0 ? this.credentials[this.credentials.length - 1] : null;
    }

    saveCredential(credentialDTO: CredentialDTO): Credential {
        const createdAt: string = DateTime.utc().toISO();
        const id = uuidv4();
        const credential: Credential = {
            id,
            createdAt,
            ...credentialDTO
        };
        this.credentials = [...this.credentials, credential]
        return credential;
    }
}
