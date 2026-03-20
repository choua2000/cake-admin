export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();

    // Skip if we're hitting the login page
    if (to.path === '/login') {
        if (authStore.isAuthenticated) {
            return navigateTo('/');
        }
        return;
    }

    // Check if authenticated for other routes
    if (!authStore.isAuthenticated) {
        // Attempt to restore from cookie first
        authStore.checkAuth();
        if (!authStore.isAuthenticated) {
            return navigateTo('/login');
        }
    }
});
