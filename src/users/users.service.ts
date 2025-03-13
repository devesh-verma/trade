import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../core/databases/prisma/prisma.service';
import { IUser } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Find a user by their email address
   * @param email - The email address to search for
   * @returns Promise resolving to the user if found, null otherwise
   * @throws Will throw an error if the database query fails
   */
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      this.logger.error(`Failed to find user by email: ${email}`, error);
      throw error;
    }
  }

  /**
   * Find a user by their ID
   * @param id - The user ID to search for
   * @returns Promise resolving to the user if found, null otherwise
   * @throws Will throw an error if the database query fails
   */
  async findById(id: number): Promise<IUser | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to find user by id: ${id}`, error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param email - The email address for the new user
   * @param password - The plain text password (will be hashed)
   * @returns Promise resolving to the created user
   * @throws Will throw an error if user creation fails
   */
  async create(email: string, password: string): Promise<IUser> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      return await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create user with email: ${email}`, error);
      throw error;
    }
  }

  /**
   * Update a user's refresh token
   * @param userId - The ID of the user to update
   * @param refreshToken - The new refresh token, or null to remove it
   * @throws Will throw an error if the update fails
   */
  async updateRefreshToken(
    userId: number,
    refreshToken: string | null,
  ): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update refresh token for user: ${userId}`,
        error,
      );
      throw error;
    }
  }
}
