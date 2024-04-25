import { useRouter } from 'next/navigation';

export default function useAuth() {
  const router = useRouter();

  async function checkStatus(): Promise<boolean> {
    return await fetch('/api/auth/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
      credentials: 'include',
    }).then((res) => {
      return res.status == 200;
    });
  }

  async function login(username: string, password: string) {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.message === 'Authorized!') {
          localStorage.setItem('user', JSON.stringify(res.user));
          router.push('/dashboard');
        }
      });
  }

  async function logout() {
    const user_id = JSON.parse(localStorage.getItem('user') ?? '{}').user_id;

    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id }),
    }).then((res) => {
      if (res.status === 200) {
        localStorage.removeItem('user');
        router.push('/');
      }
    });
  }

  return {
    checkStatus,
    login,
    logout,
  };
}
