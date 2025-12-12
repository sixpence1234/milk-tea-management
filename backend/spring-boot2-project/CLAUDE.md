# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **clean and minimal Spring Boot 2.7.18** starter project with **MyBatis Plus 3.5.3.1** and **MySQL 5.7** support. It's designed as a clean foundation for building REST APIs.

## Common Commands

### Build & Run
```bash
# Compile the project
mvn clean compile

# Run the application directly
mvn spring-boot:run

# Package as JAR
mvn clean package

# Run the packaged JAR
java -jar target/spring-boot2-project-0.0.1-SNAPSHOT.jar
```

### Testing
```bash
# Run all tests
mvn test

# Run a specific test class
mvn test -Dtest=SpringBoot2ProjectApplicationTests
```

## Architecture

### Package Structure
```
src/main/java/com/example/springboot2project/
├── SpringBoot2ProjectApplication.java    # Main Spring Boot application
├── config/
│   └── MybatisPlusConfig.java            # MyBatis Plus configuration (auto-fill)
├── controller/
│   └── HealthController.java             # Simple REST endpoints
├── common/
│   ├── Constants.java                     # System constants
│   └── Result.java                        # Unified response wrapper
├── pojo/                                  # POJO objects (Plain Old Java Objects)
│   ├── domain/
│   │   └── User.java                      # Domain entity (DB model)
│   ├── dto/
│   │   └── UserDTO.java                   # Data Transfer Object
│   ├── vo/
│   │   └── UserVO.java                    # View Object (for frontend)
│   ├── request/
│   │   └── UserCreateRequest.java         # Request parameters
│   └── response/
│       └── UserPageResponse.java          # Response wrapper
├── exception/
│   ├── BusinessException.java             # Custom business exception
│   └── GlobalExceptionHandler.java        # Global exception handler
└── utils/
    └── DateUtils.java                     # Utility classes

src/main/resources/
├── application.properties                  # Application configuration
└── db/migration/
    └── V1__Create_user_table.sql         # Database schema (optional)
```

### Key Technologies
- **Spring Boot 2.7.18** - Application framework
- **MyBatis Plus 3.5.3.1** - ORM layer with auto-fill
- **MySQL 5.7** - Database
- **Java 1.8** - Programming language
- **Maven** - Build tool
- **Tomcat** - Embedded web server
- **Bean Validation** - Parameter validation
- **Hibernate Validator 6.2.5** - Validation implementation

## Configuration

### application.properties
```properties
# Default port
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name?useUnicode=true&characterEncoding=utf8&serverTimezone=GMT%2B8&useSSL=false
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.jdbc.Driver

# MyBatis Plus Configuration
mybatis-plus.configuration.map-underscore-to-camel-case=true
```

### Required Dependencies
Already configured in `pom.xml`:                                            m
- Spring Boot Starter Web
- Spring Boot Starter Test
- MySQL Connector Java 5.1.49
- MyBatis Plus Boot Starter 3.5.3.1
- Lombok

## REST API Endpoints

All endpoints are available at the root context:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message with API info |
| GET | `/health` | Health check endpoint |
| GET | `/api/hello` | Simple hello endpoint |

**Example Requests**:
```bash
# Welcome endpoint
curl http://localhost:8080/

# Health check
curl http://localhost:8080/health

# Hello endpoint
curl http://localhost:8080/api/hello
```

## MyBatis Plus Features

### Auto-Fill Configuration
Located in `src/main/java/com/example/springboot2project/config/MybatisPlusConfig.java`:
- **Insert**: Automatically populates `createTime` and `updateTime`
- **Update**: Automatically populates `updateTime`

### Database Migration
Location: `src/main/resources/db/migration/V1__Create_user_table.sql`
- Contains sample schema for a `user` table
- Includes test data

## Code Generation

MyBatis Plus provides powerful code generation capabilities to quickly generate Entity, Mapper, Service, and Controller layers.

### Recommended: Online Generator
**Access**: https://www.baomidou.com/center/generator/

**Steps**:
1. Configure database connection (MySQL)
2. Select tables to generate
3. Set package name: `com.example.springboot2project`
4. Select generation targets:
   - Entity → `pojo/domain/`
   - Mapper → `mapper/`
   - Service → `service/`
   - Controller → `controller/`
5. Download and extract to project

### Alternative: IDEA Plugin (MyBatisX)
1. Install "MyBatisX" plugin in IntelliJ IDEA
2. Connect to database via Database tool window
3. Right-click table → "MyBatisX-Generator"
4. Configure target package and generate

**Documentation**: See `CODER_GENERATOR.md` for detailed guide.

## Database Setup

### 1. Install MySQL 5.7
```bash
docker run -d \
  --name mysql57 \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=your_password \
  mysql:5.7
```

### 2. Create Database
```sql
CREATE DATABASE your_database_name
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 3. Run Migration Script
Execute `src/main/resources/db/migration/V1__Create_user_table.sql`

### 4. Update Configuration
Edit `application.properties` with your actual database credentials.

## Important Notes

1. **Default Port**: 8080 (not 8090)

2. **Clean Structure**: This is a minimal starter. Add your own:
   - Controllers
   - Services
   - Mappers
   - Entities

3. **MyBatis Plus Auto-Fill**: Ensure your entity fields match the auto-fill configuration:
   ```java
   @TableField(fill = FieldFill.INSERT)
   private LocalDateTime createTime;

   @TableField(fill = FieldFill.INSERT_UPDATE)
   private LocalDateTime updateTime;
   ```

4. **Auto-configuration**: MyBatis Plus and DataSource are auto-configured by Spring Boot

## Development Tips

- The project follows Spring Boot conventions
- Use `@RestController` for REST APIs
- Use `@Service` for business logic
- Use `@Mapper` or `@Repository` for data access
- Use `@Configuration` for additional configurations
