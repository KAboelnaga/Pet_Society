from django.shortcuts import render, redirect, get_object_or_404
from .models import User
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib import messages
from .forms import UserForm, LoginForm, CustomUserForm
from django.contrib.auth.forms import UserCreationForm

# Create your views here.

def user_register (request):
    if request.user.is_authenticated:
        return redirect('blogs:home')
    
    if request.method == 'POST':
        register_form = UserForm(request.POST)
        if register_form.is_valid():
            register_form.save()
            messages.success(request, 'Registration successful! Please log in.')
    else:
        register_form = UserForm()
    context = {'register_form': register_form}
    return render(request, 'users/register.html', context)

def user_login (request):

    if request.user.is_authenticated:
        return redirect('blogs:home')

    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if not user.is_active:
                messages.error(request,"Sorry, you are blocked. Contact the admin.")
                logout(request)
                return redirect('blog_auth:login')
            
            login(request, user)

            if request.GET.get('next') is not None:
                return redirect(request.GET.get('next'))
            
            return redirect('blogs:home')
    else:
        form = LoginForm()
    context = {'form': form}
    return render(request, 'users/login.html', context)

def user_logout(request):
    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('users:login')

def blocked_page(request):
    return render(request, 'users/blocked.html')


def is_superadmin(user):
    return user.is_authenticated and (user.is_superuser or user.is_admin)

@user_passes_test(is_superadmin)
def manage_users(request):
    users = User.objects.exclude(pk=request.user.pk)
    return render(request, "users/manage_users.html", {"users": users})

@login_required
@user_passes_test(is_superadmin)
def toggle_admin(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    user.is_admin = not user.is_admin
    user.save()
    return redirect("users:manage_users")

@login_required
@user_passes_test(is_superadmin)
def toggle_block(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    user.is_blocked = not user.is_blocked
    user.save()
    return redirect("users:users_list")



User = get_user_model()

def users_list(request):
    users = User.objects.all()
    return render(request, 'users/users_list.html', {'users': users})




def create_user_view(request):
    if request.method == 'POST':
        form = CustomUserForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "User created successfully.")
            return redirect('users:users_list')
    else:
        form = CustomUserForm()
    return render(request, 'users/create_user.html', {'form': form})


    return render(request, 'users/create_user.html', {'form': form})
def user_edit(request, pk):
    user = get_object_or_404(User, pk=pk)
    if request.method == 'POST':
        new_email = request.POST.get('email')
        new_username = request.POST.get('username')
        email_exists = User.objects.exclude(pk=pk).filter(email=new_email).exists()
        username_exists = User.objects.exclude(pk=pk).filter(username=new_username).exists()
        if email_exists:
            messages.error(request, 'This email is already in use.')
        elif username_exists:
            messages.error(request, 'This username is already in use.')
        else:
            user.email = new_email
            user.username = new_username
            user.save()
            messages.success(request, 'User updated successfully!')
            return redirect('users:users_list')
    return render(request, 'users/user_edit.html', {'user': user})


def user_delete(request, pk):
    user = get_object_or_404(User, pk=pk)
    if user.is_superuser:
        messages.error(request, "You can't delete another admin.")
        return redirect('users:users_list')
    if request.method == 'POST':
        user.delete()
        messages.success(request, 'User deleted successfully!')
        return redirect('users:users_list')
    return render(request, 'users/user_confirm_delete.html', {'user': user})


@login_required
def promote_user_view(request, user_id):
    user_to_promote = get_object_or_404(User, id=user_id)
    current_user = request.user

    if user_to_promote.is_superuser or user_to_promote.is_admin:
        messages.error(request, "Cannot promote or demote a superuser or admin.")
    elif user_to_promote.is_staff:
        if current_user.is_superuser:
            user_to_promote.is_staff = False
            user_to_promote.save()
            messages.success(request, "User's admin privileges have been removed.")
        else:
            messages.error(request, "You do not have permission to demote this user.")
    else:
        user_to_promote.is_staff = True
        user_to_promote.save()
        messages.success(request, "User has been promoted to admin.")

    return redirect('users:users_list')