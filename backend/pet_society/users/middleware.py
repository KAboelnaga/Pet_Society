from django.shortcuts import redirect
from django.urls import reverse

class BlockedUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        blocked_url = reverse('users:blocked_page')
        logout_url = reverse('users:logout')
        login_url = reverse('users:login')
        
        allowed_paths = [blocked_url, logout_url, login_url]

        if (
            request.user.is_authenticated and 
            getattr(request.user, "is_blocked", False) and 
            request.path not in allowed_paths and 
            not request.path.startswith("/static/")
        ):
            return redirect("users:blocked_page")

        return self.get_response(request)
