import { Controller, Post, Body, UnauthorizedException, Get, Param, Patch, Delete } from '@nestjs/common';import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() body: any) {
    // 1. Buscamos al usuario por email (usamos any para evitar quejas de TypeScript)
    const users = await this.userService.findAll(); 
    const user = users.find((u: any) => u.email === body.email);

    // 2. Verificamos la contraseña
    if (!user || user.password !== body.password) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // 3. Le quitamos la contraseña copiando el objeto
    const userWithoutPassword = { ...user } as any;
    delete userWithoutPassword.password; // Borramos la clave por seguridad
    
    return userWithoutPassword;
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id); // <--- SIN EL '+'
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto); // <--- SIN EL '+'
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id); // <--- SIN EL '+'
  }
}