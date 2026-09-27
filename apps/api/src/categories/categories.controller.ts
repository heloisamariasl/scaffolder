import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova categoria' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso', type: CategoryDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos', type: ProblemDetailsDto })
  @ApiResponse({ status: 409, description: 'Já existe categoria com esse nome', type: ProblemDetailsDto })
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryDto> {
    return this.categoriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias' })
  @ApiResponse({ status: 200, description: 'Lista de categorias', type: [CategoryDto] })
  async findAll(): Promise<CategoryDto[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma categoria' })
  @ApiResponse({ status: 200, description: 'Dados da categoria', type: CategoryDto })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada', type: ProblemDetailsDto })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<CategoryDto> {
    return this.categoriesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada com sucesso', type: CategoryDto })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada', type: ProblemDetailsDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir categoria' })
  @ApiResponse({ status: 204, description: 'Categoria excluída com sucesso' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada', type: ProblemDetailsDto })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}