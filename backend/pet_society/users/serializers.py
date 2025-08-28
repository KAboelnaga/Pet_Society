from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'image', 'bio', 'location')
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long")
        if not value.replace('_', '').replace('.', '').isalnum():
            raise serializers.ValidationError("Username must be letters, numbers, underscores, or dots only")
        return value.lower()

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value.lower()
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        if email and password:
            user = authenticate(username=email, password=password)
            if user:
                if user.is_blocked:
                    raise serializers.ValidationError("User is blocked")
                attrs['user'] = user
            else:
                raise serializers.ValidationError("Invalid credentials")
        else:
            raise serializers.ValidationError("Email and password are required")
        return attrs
    
class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_blocked', 'is_admin','is_superuser', 'created_at', 'image', 'bio', 'location', 'followers_count', 'following_count', 'posts_count', 'is_following')
        read_only_fields = ('id', 'created_at')
    
    def get_followers_count(self, obj):
        return obj.followers.count() if hasattr(obj, 'followers') else 0
    
    def get_following_count(self, obj):
        return obj.following.count() if hasattr(obj, 'following') else 0
    
    def get_posts_count(self, obj):
        return obj.posts.count() if hasattr(obj, 'posts') else 0
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        print(f"🔍 Serializer - request: {request}")
        if request and hasattr(request, 'user'):
            print(f"🔍 Serializer - request.user: {request.user}")
            print(f"🔍 Serializer - target user (obj): {obj}")
            print(f"🔍 Serializer - is_authenticated: {request.user.is_authenticated}")
            if request.user.is_authenticated:
                # Check if the current user (request.user) is following the target user (obj)
                # This means: does a Follow object exist where follower=request.user and followed=obj
                from followers.models import Follow
                is_following = Follow.objects.filter(
                    follower=request.user,
                    followed=obj
                ).exists()
                print(f"🔍 Serializer - Follow query: follower={request.user}, followed={obj}")
                print(f"🔍 Serializer - is_following result: {is_following}")
                return is_following
        print(f"🔍 Serializer - returning False (no auth)")
        return False
    
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'image', 'bio', 'location')
        read_only_fields = ('email',)
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("Username already exists")
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long")
        if not value.replace('_', '').replace('.', '').isalnum():
            raise serializers.ValidationError("Username must be letters, numbers, underscores, or dots only")
        return value.lower()

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("Email already exists")
        return value.lower()
    
    def validate_bio(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError("Bio must be 500 characters or less")
        return value
    
    def validate_location(self, value):
        if value and len(value) > 100:
            raise serializers.ValidationError("Location must be 100 characters or less")
        return value


    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.image = validated_data.get('image', instance.image)
        instance.bio = validated_data.get('bio', instance.bio)
        instance.location = validated_data.get('location', instance.location)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class UserPasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords do not match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

