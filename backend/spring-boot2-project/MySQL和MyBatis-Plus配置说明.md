# MySQL 5.7 + MyBatis Plus 配置说明

## 项目结构

```
src/main/java/com/example/springboot2project/
├── config/
│   └── MybatisPlusConfig.java          # MyBatis Plus配置类
├── controller/
│   └── UserController.java              # 用户REST接口
├── entity/
│   └── User.java                        # 用户实体类
├── mapper/
│   └── UserMapper.java                  # 用户Mapper接口
├── service/
│   ├── UserService.java                 # 用户服务接口
│   └── impl/
│       └── UserServiceImpl.java         # 用户服务实现类
└── SpringBoot2ProjectApplication.java   # 主应用程序

src/main/resources/
├── application.properties                # 应用配置
├── db/migration/
│   └── V1__Create_user_table.sql       # 数据库初始化脚本
```

## 配置内容

### 1. 依赖配置 (pom.xml)
- MySQL Connector/J 5.1.49
- MyBatis Plus 3.5.3.1
- Lombok

### 2. 数据库配置 (application.properties)
```properties
# 修改以下配置为你的实际值：
spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. MyBatis Plus功能
- ✅ 自动填充 (createTime, updateTime)
- ✅ 分页插件
- ✅ 逻辑删除
- ✅ 驼峰命名转换
- ✅ Mapper扫描配置

## 使用步骤

### 1. 安装MySQL 5.7

**方式一：直接安装**
- 下载地址：https://dev.mysql.com/downloads/mysql/5.7.html
- 安装后启动MySQL服务

**方式二：Docker安装**
```bash
docker run -d \
  --name mysql57 \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=your_password \
  mysql:5.7
```

### 2. 创建数据库

```sql
CREATE DATABASE your_database_name
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 3. 运行初始化脚本

执行 `src/main/resources/db/migration/V1__Create_user_table.sql` 文件创建用户表。

### 4. 更新配置

编辑 `src/main/resources/application.properties`，修改：
- `your_database_name` 为实际数据库名
- `your_username` 为MySQL用户名
- `your_password` 为MySQL密码

### 5. 运行项目

```bash
# 编译项目
mvn clean compile

# 运行项目
mvn spring-boot:run
```

## API接口

项目启动后，可通过以下接口访问：

- `GET /api/users` - 分页查询用户列表
- `GET /api/users/{id}` - 根据ID查询用户
- `POST /api/users` - 新增用户
- `PUT /api/users/{id}` - 更新用户
- `DELETE /api/users/{id}` - 删除用户（逻辑删除）
- `GET /api/users/username/{username}` - 根据用户名查询

### 示例请求

```bash
# 查询所有用户
curl http://localhost:8899/api/users

# 根据ID查询
curl http://localhost:8899/api/users/1

# 新增用户
curl -X POST http://localhost:8899/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"newuser@example.com","age":25}'
```

## MyBatis Plus常用功能

### 1. 基础CRUD
```java
// 插入
userService.save(user);

// 根据ID查询
User user = userService.getById(id);

// 更新
userService.updateById(user);

// 删除（逻辑删除）
userService.removeById(id);

// 条件查询
List<User> users = userService.list(
    new LambdaQueryWrapper<User>()
        .eq(User::getAge, 25)
        .orderByDesc(User::getCreateTime)
);
```

### 2. 分页查询
```java
Page<User> page = userService.page(
    new Page<>(1, 10),  // 第1页，每页10条
    new LambdaQueryWrapper<User>().eq(User::getAge, 25)
);
```

### 3. 自定义SQL
在Mapper接口中添加：
```java
@Select("SELECT * FROM user WHERE age >= #{age}")
List<User> selectByAge(@Param("age") Integer age);
```

## 注意事项

1. **时区配置**：application.properties中已配置`serverTimezone=GMT%2B8`
2. **字符编码**：使用`utf8`编码，确保中文正确显示
3. **逻辑删除**：删除操作会设置`deleted=1`，不会真正删除数据
4. **自动填充**：插入和更新时会自动填充`createTime`和`updateTime`字段
