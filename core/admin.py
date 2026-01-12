from django.contrib import admin
from .models import User, Appointment, Contact, LoginHistory, Admin, Doctor, Rating

# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'age', 'gender', 'created_at')
    search_fields = ('name', 'email')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'doctor', 'appointment_date', 'status', 'created_at')
    list_filter = ('status', 'doctor', 'appointment_date')
    search_fields = ('name', 'email', 'phone')

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')
    search_fields = ('name', 'email')

@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    list_display = ('email', 'login_time')
    search_fields = ('email',)

@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    list_display = ('username',)

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialization', 'created_at')
    search_fields = ('name', 'specialization')

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('doctor_name', 'user_name', 'rating', 'created_at')
    list_filter = ('rating', 'doctor_name')
    search_fields = ('user_name', 'doctor_name')
