import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto): Promise<CategoryDto> {
    try {
      const created = await this.prisma.category.create({
        data: {
          name: dto.name.trim(),
          color: dto.color || '#3B82F6',
        },
      });
      return this.serialize(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma categoria com esse nome.');
      }
      throw error;
    }
  }

  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return categories.map((c) => this.serialize(c));
  }

  async findById(id: string): Promise<CategoryDto> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }
    return this.serialize(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDto> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    try {
      const updated = await this.prisma.category.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.color !== undefined ? { color: dto.color } : {}),
        },
      });
      return this.serialize(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma categoria com esse nome.');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Categoria não encontrada.');
    }
    // Exclusão definitiva (não precisa de soft delete: categoria não é dado pessoal).
    // As tarefas que usavam essa categoria ficam com categoryId = null (onDelete: SetNull no schema).
    await this.prisma.category.delete({ where: { id } });
  }

  private serialize(category: any): CategoryDto {
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      createdAt: new Date(category.createdAt).toISOString(),
      updatedAt: new Date(category.updatedAt).toISOString(),
    };
  }
}