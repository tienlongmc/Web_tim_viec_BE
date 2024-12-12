# Why API Login Doesn't Work

The login API is not working due to several issues:

1. **Missing Required Decorators**: 
   - The `HandleLogin` method in `auth.controller.ts` is missing the `@UseGuards(LocalAuthGuard)` decorator which is necessary to trigger the Passport local authentication.
   - It's also missing the `@Post('login')` decorator to properly define the route.

2. **Local Strategy Implementation**:
   - The local strategy in `local.strategy.ts` has incomplete error handling - it checks for invalid user but doesn't properly throw the UnauthorizedException.

## How to Fix

1. Add the missing decorators to the login endpoint in `auth.controller.ts`:
```typescript
@UseGuards(LocalAuthGuard)
@Post('login')
HandleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
  return this.authService.login(req.user, response);
}
```

2. Complete the error handling in `local.strategy.ts`:
```typescript
if (!user) {
  throw new UnauthorizedException("Invalid credentials");
}
```

These changes will enable proper authentication flow and error handling for the login endpoint.