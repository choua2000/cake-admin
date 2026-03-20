export const useApi = () => {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();
    const apiBase = config.public.apiBase;

    const fetchWithAuth = async (url: string, options: any = {}) => {
        return $fetch(`${apiBase}${url}`, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
            },
            async onResponseError({ response }: { response: any }) {
                if (response.status === 401) {
                    authStore.logout();
                }
            }
        });
    };

    return {
        get: (url: string, options?: any) => fetchWithAuth(url, { ...options, method: 'GET' }),
        post: (url: string, body?: any, options?: any) => fetchWithAuth(url, { ...options, method: 'POST', body }),
        put: (url: string, body?: any, options?: any) => fetchWithAuth(url, { ...options, method: 'PUT', body }),
        delete: (url: string, options?: any) => fetchWithAuth(url, { ...options, method: 'DELETE' }),
    };
};
