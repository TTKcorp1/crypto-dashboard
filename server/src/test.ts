import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function runSmokeTest() {
  const email = 'smoke@example.com';
  const password = 'StrongPass123!';

  const hashedPassword = await bcrypt.hash(password, 10);
  const passwordMatches = await bcrypt.compare(password, hashedPassword);
  const token = jwt.sign(
    { id: 'smoke-user-id', email },
    process.env.JWT_SECRET || 'development-secret',
    { expiresIn: '1d' }
  );

  if (!passwordMatches || !token) {
    throw new Error('Smoke test failed: password verification or JWT generation did not work.');
  }

  console.log('Smoke test passed: password hashing and JWT generation are working.');
}

runSmokeTest().catch((error: Error) => {
  console.error(error.message);
  process.exit(1);
});