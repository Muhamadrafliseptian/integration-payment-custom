import { Header, Injectable } from '@nestjs/common';
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

    async getSymmetricSignature(amounts: any): Promise<any> {
        const key = this.configService.get<string>('access_token_key');
        try {
            const accessToken = await this.createAccessToken();
            const clientSecret = "5acebfb3-f89a-4d80-a3d3-bae8b7513b61";
            const httpMethod = "POST";
            const relativeUrl = "/openapi/v1.0/qr/qr-mpm-generate";
            const X_TIMESTAMP = moment().tz('Asia/Jakarta');
            const timestamp = X_TIMESTAMP.format('YYYY-MM-DDTHH:mm:ssZ');
            const validityPeriod = X_TIMESTAMP.clone().add(30, 'minutes').format('YYYY-MM-DDTHH:mm:ssZ');
            const makeQris = await this.postBodyQris(amounts);

            const requestBody = {
                "amount": {
                    "value": amounts,
                    "currency": makeQris.currency
                },
                "merchantId": '000002094',
                "terminalId": 'A1026229',
                "partnerReferenceNo": makeQris.reference_id,
                "validityPeriod": validityPeriod
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
            };
        } catch (err) {
            console.error('Error generating signature:', err);
            throw err;
        }
    }

    async generateQrisBca(headers: any, requestData: any) {

        try {
            const body = {
                "amount": {
                    "value": `${requestData.value}`,
                    "currency": "IDR"
                },
                "merchantId": "000002094",
                "terminalId": "A1026229",
                "partnerReferenceNo": headers['x-external-id'],
                "validityPeriod": `${requestData.validityPeriod}`
            };

            const headersData = {
                "Content-Type": "application/json",
                "Authorization": headers['authorization'],
                "X-Timestamp": headers['x-timestamp'],
                "X-External-ID": headers['x-external-id'],
                "X-Partner-ID": '000002094',
                "X-Signature": headers['x-signature'],
                "Channel-ID": '95251'
            }

            const generateResponse = await axios({
                url: 'https://devapi.klikbca.com/openapi/v1.0/qr/qr-mpm-generate',
                method: "POST",
                headers: {
                    ...headersData
                },
                data: JSON.stringify(body),
            })

            return generateResponse.data;

        } catch (err) {
            console.log(err);
        }
    }

    async postBodyQris(amounts: any): Promise<any> {
        try {
            const randomInvoice = this.generateRandomReferenceNumber()
            const invoiceId = `INVBCA${randomInvoice}`;
            const makeQris = await this.paymentRepository.save(
                this.paymentRepository.create({
                    amount: amounts,
                    currency: 'IDR',
                    bank_code: 'QRISBCA',
                    invoice_id: invoiceId,
                    reference_id: this.generateRandomReferenceNumber(),
                    status_pembayaran: "SUCCESS"
                })
            );

            const { amount, currency, bank_code, invoice_id, reference_id } = makeQris;

            return {
                amount, currency, bank_code, invoice_id, reference_id
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