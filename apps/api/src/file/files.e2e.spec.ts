
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { TestSuite } from '../test.suite';
import { AuthFixture } from '../auth/auth.fixture';
import * as path from 'path';

describe('FileController (e2e)', () => {
  const app = new TestSuite(AppModule, [AuthFixture], []);

  describe('/files/upload', () => {
    it('should return 400 Bad Request for invalid file', async () => {
      const filePath = path.join(__dirname, 'testFiles', 'invalid-file.txt');
      const { accessToken } = await app.generateTokensForUser(AuthFixture.USER_1);
      const response = await request(app.getHttpServer())
        .post('/files/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('preview', 'true') // Set any query parameters if needed
        .attach('files', filePath); // Path to an invalid file

      expect(response.status).toBe(415);
      expect(response.body.message).toContain('File type is not matching');
    });

    it('should successfully upload a valid file', async () => {
      const filePath = path.join(__dirname, 'testFiles', 'valid-file.png');
      const { accessToken } = await app.generateTokensForUser(AuthFixture.USER_1);
      
      const response = await request(app.getHttpServer())
        .post('/files/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('preview', 'false')
        .attach('files', filePath);

      expect(response.status).toBe(201); 
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
})
