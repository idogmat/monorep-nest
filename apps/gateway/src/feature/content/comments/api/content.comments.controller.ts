import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ContentClientService } from '../../../../support.modules/grpc/grpc.content.service';
import { AuthGuard } from '../../../../common/guard/authGuard';
import { InputCommentModel } from './model/input/input.comment.model';

@ApiTags('Comments')
@Controller('content/comments')
export class ContentCommentsController {
  constructor(
    private readonly contentClientService: ContentClientService) {

  }

  // @ApiBody({ type: InputCommentModel })
  // @Post()
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  // async createComment(
  //   @Req() req,
  //   @Body() commentCreateModel: InputCommentModel
  // ){
  //   // const userId = req.user.userId;
  //   // await this.contentClientService.createComment();
  // }

}