import { Router } from 'express';
import { hash } from 'bcryptjs';
import { createJSONToken, isValidPassword } from '../util/auth.js';
import { readData, writeData } from '../util/users.js';

const router = Router();

// POST /auth/signup
router.post('/signup', async (req, res, next) => {
  const data = req.body;
  let { email, password } = data;

  if (!email || email.trim().length === 0 || !email.includes('@') || 
      !password || password.trim().length < 7) {
    return res.status(422).json({
      message: 'Invalid input - password should be at least 7 characters long.',
      errors: {
        credentials: 'Invalid email or password entered.'
      }
    });
  }

  try {
    const existingUsers = await readData();
    
    if (existingUsers.find(user => user.email === email)) {
      return res.status(422).json({
        message: 'User exists already',
        errors: {
          credentials: 'User with the email address exists already.'
        }
      });
    }

    const hashedPw = await hash(password, 12);
    const newUser = {
      email: email,
      password: hashedPw
    };
    
    existingUsers.push(newUser);
    await writeData(existingUsers);
    
    const authToken = createJSONToken(email);
    res.status(201).json({ message: 'User created.', user: { email }, token: authToken });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({
      message: 'Invalid credentials.',
      errors: {
        credentials: 'Invalid email or password entered.'
      }
    });
  }

  try {
    const existingUsers = await readData();
    const user = existingUsers.find(user => user.email === email);

    if (!user) {
      return res.status(422).json({
        message: 'Invalid credentials.',
        errors: {
          credentials: 'Invalid email or password entered.'
        }
      });
    }

    const pwIsValid = await isValidPassword(password, user.password);
    if (!pwIsValid) {
      return res.status(422).json({
        message: 'Invalid credentials.',
        errors: {
          credentials: 'Invalid email or password entered.'
        }
      });
    }

    const token = createJSONToken(email);
    res.json({ message: 'User logged in.', user: { email }, token });
  } catch (error) {
    next(error);
  }
});

export default router;