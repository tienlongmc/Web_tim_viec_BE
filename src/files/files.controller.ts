import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post('upload')
  @ResponseMessage("Upload a file")
  @UseInterceptors(FileInterceptor('fileUpload',
    {
      storage: diskStorage({
        // ✅ Lưu file vào thư mục "resume" thay vì "default"
        destination: './public/images/resume',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const baseName = file.originalname.replace(ext, '');
          cb(null, `${baseName}-${uniqueSuffix}${ext}`);
        },
      }),
    }
  ),
  )
  uploadFile(@UploadedFile(
    new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: /^(jpg|image\/jpeg|jpeg|png|image\/png|gif|txt|pdf|application\/pdf|doc|docx|text\/plain)$/i,
      })
      .addMaxSizeValidator({
        maxSize: 1024 * 1024 //kb
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY // ma loi 422
      }),

  ) file: Express.Multer.File) {
    return {
      fileName: file.filename,
      path: `/public/images/${file.filename}`, // Trả về đường dẫn file
    }
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
