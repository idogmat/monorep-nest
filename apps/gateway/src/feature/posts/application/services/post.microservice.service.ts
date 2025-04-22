import { PostCreateModel } from '../../api/model/input/post.create.model';
import { GateService } from '../../../../common/gate.service';
import { InterlayerNotice } from '../../../../common/error-handling/interlayer.notice';
import { ENTITY_POST } from '../../../../common/entities.constants';
import { FileError } from '../../../../common/error-handling/file.error';
import FormData from 'form-data';
import fs, { unlinkSync } from 'fs';
import { Injectable } from '@nestjs/common';
import { PostViewModel } from '../../api/model/output/post.view.model';
import { PagedResponse } from '../../../../common/pagination/paged.response';
import { PaginationSearchPostTerm } from '../../../../../../libs/common/pagination/query.posts.model';
import { PostUpdateModel } from '../../api/model/input/post.update.model';

@Injectable()
export class PostMicroserviceService {
  constructor(private gateService: GateService) {}

  async createPost(
    postDto: PostCreateModel,
    files: Express.Multer.File[],
    userId: string,
  )
    // : Promise<InterlayerNotice>
  {
    const formData = new FormData();
    files.forEach((file) => {
      if (!file.path) {
        console.error('File path is missing:', file);
        return InterlayerNotice.createErrorNotice(
          FileError.INVALID_FORMAT_FILES,
          ENTITY_POST,
          400
        );
      }
      formData.append('files', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    formData.append('postData', JSON.stringify(postDto));

    const headers = formData.getHeaders();
    headers['Content-Type'] = 'multipart/form-data';
    headers['X-UserId'] = userId;


    try {
      const response = await this.gateService.postServicePost('create-post', formData, headers);
      return new InterlayerNotice(response.data);
    } catch (error) {
      console.error("error send to post", error);
      return InterlayerNotice.createErrorNotice(
        FileError.SEND_ERROR,
        ENTITY_POST,
        500
      );
    } finally {
      for (const file of files) {
        try {
          await unlinkSync(file.path);
          console.log(`File ${file.originalname} deleted successfully`);
        } catch (error) {
          console.error(`Error deleting file ${file.originalname}:`, error);
        }
      }
    }
  }

  async getPostById(postId: string): Promise<InterlayerNotice<PostViewModel|null>> {

    const headers = {
      'X-PostId': postId,
    }

    return  await this.gateService.postServiceGet<InterlayerNotice<PostViewModel|null>>('get-post-by-id',  headers, {});

  }

  async getPosts(queryDto: PaginationSearchPostTerm) {

    return await this.gateService.postServiceGet<InterlayerNotice<PagedResponse<PostViewModel>>>('get-posts', {}, queryDto.toQueryParams());

  }


  async updatePost(param: { updateDto: PostUpdateModel; postId: string; userId: string }) {
    const headers = {
      'X-PostId': param.postId,
      'X-UserId': param.userId,
    };
    const result = await this.gateService.postServicePut('update-post',
      param.updateDto,
      headers);

    return result;
  }

  async deletePost(param: { postId: string; userId: string }) {
    const headers = {
      'X-PostId': param.postId,
      'X-UserId': param.userId,
    };

    const result = await this.gateService.postServiceDelete('delete-post', headers);

    return result;
  }
}
