import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StudySessionsModule } from './study-sessions/study-sessions.module'
import { TasksModule } from './tasks/tasks.module';
import { TagsModule } from './tags/tags.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ExamsModule } from './exams/exams.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    StudySessionsModule,
    TasksModule,
    TagsModule,
    SubjectsModule,
    ExamsModule,
  ],
})
export class AppModule {}