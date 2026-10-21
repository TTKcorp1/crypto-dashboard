import bcrypt from 'bcryptjs';

async function test() {
  const password = 'mypassword123';

  const hashed = await bcrypt.hash(password, 10);

  console.log('Original:', password);
  console.log('Hashed:', hashed);
}

test();