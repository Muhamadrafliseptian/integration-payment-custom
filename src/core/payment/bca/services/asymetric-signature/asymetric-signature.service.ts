import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as moment from 'moment-timezone';

@Injectable()
export class AsymmetricSignatureService {
    constructor(
        private readonly configService: ConfigService
    ) { }

    getAsymmetricSignature() {
        const pemFilePath = 'src/core/payment/pemKey/private-key.pem';

        const privateKey = fs.readFileSync(pemFilePath, 'utf8')
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

