import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPoint } from 'src/core/services_modules/endpoint-service';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import * as CryptoJS from "crypto-js"

@Injectable()
export class AccessTokenService {
    constructor(
        private readonly configService: ConfigService,
        private readonly pointService: AccessTokenPoint
    ) { }

    async createAccessToken(): Promise<any> {
        try {
            const [signature, formattedTimestamp] = await this.getAsymmetricSignature();
            const clientId = this.configService.get<string>('client_id');
            const key = this.configService.get<string>('access_token_key');
            const headers = {
                'X-TIMESTAMP': formattedTimestamp,
                'X-CLIENT-KEY': clientId,
                'X-SIGNATURE': signature
            };

            const response = await this.pointService.createTokenPoint(
                { grantType: 'client_credentials' },
                headers
            );

            const secretToken = CryptoJS.AES.encrypt(response.data.accessToken, key).toString();

            return secretToken;
        } catch (err) {
            console.error('Error creating access token:', err);
            throw err;
        }
    }


    getAsymmetricSignature(): [string, string] {
        const pemFilePath = 'src/core/payment/pemKey/private-key.pem';
        const privateKey = fs.readFileSync(pemFilePath, 'utf8');
        const clientId = this.configService.get<string>('client_id');
        const X_TIMESTAMP = moment().tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ssZ');
        const formattedTimestamp = moment(X_TIMESTAMP).format('YYYY-MM-DDTHH:mm:ssZ');
        const StringToSign = `${clientId}|${formattedTimestamp}`;
        const signer = crypto.createSign('sha256');
        signer.update(StringToSign);
        const signature = signer.sign({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, 'base64');
        return [signature, formattedTimestamp];
    }
}

