import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import ImageKit = require('imagekit');
import { AppConfigService } from '../app-config/app-config.service';

@Injectable()
export class ImagekitService {
  private readonly client: ImageKit;

  constructor(private readonly appConfigService: AppConfigService) {
    const { publicKey, privateKey, urlEndpoint } = this.appConfigService.imagekit;
    this.client = new ImageKit({
      publicKey: publicKey || '',
      privateKey: privateKey || '',
      urlEndpoint: urlEndpoint || '',
    });
  }

  get urlEndpoint(): string {
    return this.appConfigService.imagekit.urlEndpoint || '';
  }

  /** Server-side upload of a local file. Returns ImageKit fileId + CDN url. */
  async uploadFile(
    filePath: string,
    fileName: string,
  ): Promise<{ fileId: string; url: string; filePath: string }> {
    const file = fs.readFileSync(filePath);
    const res = await this.client.upload({ file, fileName });
    return { fileId: res.fileId, url: res.url, filePath: res.filePath };
  }

  /** Short-lived params for browser-side direct uploads (public key flow). */
  getAuthenticationParameters(): { token: string; expire: number; signature: string } {
    return this.client.getAuthenticationParameters();
  }
}
