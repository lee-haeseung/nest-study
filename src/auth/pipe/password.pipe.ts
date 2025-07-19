import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class PasswordMaxLengthPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.length > 8) {
      throw new BadRequestException('비밀번호는 8자 이하로 입력해주세요.');
    }

    return value.toString();
  }
}

@Injectable()
export class PasswordMinLengthPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.length < 2) {
      throw new BadRequestException('비밀번호는 2자 이상이어야 합니다.');
    }

    return value;
  }
}
