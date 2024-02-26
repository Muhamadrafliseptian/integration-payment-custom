import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPoint } from 'src/core/services_modules/endpoint-service';
import { GenerateQrisBcaPoint } from 'src/core/services_modules/endpoint-service';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import * as CryptoJS from "crypto-js"
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { XenditEntity } from 'src/typeorm/entities/Xendit';
import { PaymentParams } from 'src/utils/type';
import { response } from 'express';
import axios from 'axios';

// axios.defaults.headers.common['Content-Type'] = 'application/json';
// axios.defaults.headers.common['X-Timestamp'] = '2024-02-26T13:44:45+07:00';
// axios.defaults.headers.common['X-Signature'] = 'nW8Zy6QbhE+h3CychNpZK2Owp8ZhD3jm4T5kPzpLpz4M5ZHMPNHNkbiBG1qjlwtLmHkifrmOoBxvkPpuGY4HPw==';
// axios.defaults.headers.common['X-External-ID'] = '7058288583';
// axios.defaults.headers.common['Channel-ID'] = '95251';
// axios.defaults.headers.common['X-Partner-ID'] = '000002094';
// axios.defaults.headers.common['Authorization'] = 'Bearer k678op1Ryr3UMhJq6dukQW89WfYRnCOmr9krR79wZOrxvx8TNgxL1n';
@Injectable()
export class AccessTokenService {
    constructor(
        @InjectRepository(XenditEntity)
        private readonly paymentRepository: Repository<XenditEntity>,
        private readonly configService: ConfigService,
        private readonly pointService: AccessTokenPoint,
        private readonly qrisPointService: GenerateQrisBcaPoint
    ) { }
    async createAccessToken(): Promise<any> {
        try {
            const [signature, formattedTimestamp] = await this.getAsymmetricSignature();
            const clientId = this.configService.get<string>('client_id');
            const headers = {
                'X-TIMESTAMP': formattedTimestamp,
                'X-CLIENT-KEY': clientId,
                'X-SIGNATURE': signature
            };

            const response = await this.pointService.createTokenPoint(
                { grantType: 'client_credentials' },
                headers
            );

            console.log('====================================');
            console.log(response.data);
            console.log('====================================');

            return response.data.accessToken;
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

    async getSymmetricSignature(): Promise<any> {
        const key = this.configService.get<string>('access_token_key')
        try {
            const accessToken = await this.createAccessToken();
            const clientSecret = "5acebfb3-f89a-4d80-a3d3-bae8b7513b61";
            const httpMethod = "POST";
            const relativeUrl = "/openapi/v1.0/qr/qr-mpm-generate";
            const X_TIMESTAMP = moment().tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ssZ');
            const timestamp = moment(X_TIMESTAMP).format('YYYY-MM-DDTHH:mm:ssZ');

            const makeQris = await this.postBodyQris();

            const requestBody = {
                "amount": {
                    "value": makeQris.actions,
                    "currency": makeQris.currency
                },
                "merchantId": makeQris.bank_code,
                "terminalId": makeQris.invoice_id,
                "partnerReferenceNo": makeQris.reference_id
            };

            const requestBodyString = JSON.stringify(requestBody);
            const sha256Hash = crypto.createHash('sha256').update(requestBodyString).digest('hex');

            const stringToSign = `${httpMethod}:${relativeUrl}:${accessToken}:${sha256Hash}:${timestamp}`;

            const signature = crypto.createHmac('sha512', clientSecret).update(stringToSign).digest();
            const signatureSymmetric = Buffer.from(signature).toString('base64');

            const encryptedSymmetric = CryptoJS.AES.encrypt(`${signatureSymmetric}`, key).toString()
            const encrypttimestamp = CryptoJS.AES.encrypt(`${timestamp}`, key).toString()
            const body = CryptoJS.AES.encrypt(`${requestBody}`, key).toString()
            const token = CryptoJS.AES.encrypt(`${accessToken}`, key).toString()

            return {
                requestBody,
                signatureSymmetric,
                accessToken,
                timestamp
                // encryptedSymmetric,
                // encrypttimestamp,
                // body,
                // token
            };
        } catch (err) {
            console.error('Error generating signature:', err);
            throw err;
        }
    }

    async generateQrisBca(headers: any) {
        try {
            const body = {
                "amount": {
                    "value": "10000.00",
                    "currency": "IDR"
                },
                "merchantId": "000002094",
                "terminalId": "A1026229",
                "partnerReferenceNo": "7001812905"
            };

            const response = await axios.post('https://devapi.klikbca.com/openapi/v1.0/qr/qr-mpm-generate', body, {
                headers: {
                    'Content-Type': headers['Content-Type'],
                    'X-Timestamp': headers['X-Timestamp'],
                    'X-Signature': headers['X-Signature'],
                    'X-External-ID': headers['X-External-ID'],
                    'Channel-ID': headers['Channel-ID'],
                    'X-Partner-ID': headers['X-Partner-ID'],
                    'Authorization': headers['Authorization']
                }
            });

            return response.data;
        } catch (err) {
            console.error('Error generating QRIS BCA:', err);
            throw err;
        }
    }

    async postBodyQris(): Promise<any> {
        const key = this.configService.get<string>('access_token_key')
        try {
            const makeQris = await this.paymentRepository.save(
                this.paymentRepository.create({
                    actions: "10000.00",
                    currency: 'IDR',
                    bank_code: '000002094',
                    invoice_id: 'A1026229',
                    reference_id: this.generateRandomReferenceNumber()
                })
            );

            const { actions, currency, bank_code, invoice_id, reference_id } = makeQris;

            return {
                actions, currency, bank_code, invoice_id, reference_id
            };
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    generateRandomReferenceNumber(): string {
        const min = 1000000000;
        const max = 9999999999;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomNumber.toString();
    }
}


