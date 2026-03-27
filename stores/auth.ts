import { defineStore } from 'pinia';

interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'staff';
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const token = ref<string | null>(null);
    const isAuthenticated = computed(() => !!token.value);

    const login = async (email: string, password: string) => {
        const config = useRuntimeConfig();
        try {
            const response: any = await $fetch(`${config.public.apiBase}/auth/login-admin`, {
                method: 'POST',
                body: { email, password }
            });
            const accessToken = response.token?.accessToken;
            if (!accessToken) throw new Error('Failed to login: No access token received.');

            token.value = accessToken;

            try {
                const payloadBase64 = accessToken.split('.')[1];
                const decodedJson = atob(payloadBase64);
                const payload = JSON.parse(decodedJson);
                user.value = {
                    id: payload.id?.toString(),
                    name: payload.name,
                    email: payload.email,
                    password: payload.password,
                    role: payload.role
                };
            } catch (err) {
                console.error('Error parsing token:', err);
                user.value = { id: '0', name: 'Admin User', email, password, role: 'admin' };
            }

            const authCookie = useCookie('auth_token');
            authCookie.value = token.value;

            const userCookie = useCookie('auth_user');
            userCookie.value = JSON.stringify(user.value);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        token.value = null;
        user.value = null;
        const authCookie = useCookie('auth_token');
        authCookie.value = null;
        const userCookie = useCookie('auth_user');
        userCookie.value = null;
        navigateTo('/login');
    };

    const checkAuth = () => {
        const authCookie = useCookie('auth_token');
        const userCookie = useCookie('auth_user');

        if (authCookie.value) {
            token.value = authCookie.value;
            if (userCookie.value) {
                user.value = typeof userCookie.value === 'string'
                    ? JSON.parse(userCookie.value)
                    : userCookie.value;
            }
        }
    };

    return {
        user,
        token,
        isAuthenticated,
        login,
        logout,
        checkAuth
    };
});
