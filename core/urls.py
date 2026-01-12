
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('signup', views.signup, name='signup'),
    path('login', views.login_view, name='login'),
    path('appointment', views.appointment, name='appointment'),
    path('contact', views.contact, name='contact'),
    path('user-profile', views.user_profile, name='user_profile'),
    path('update-profile', views.update_profile, name='update_profile'),
    path('my-appointments', views.my_appointments, name='my_appointments'),
    path('api/admin-dashboard-data', views.admin_dashboard_data, name='admin_dashboard_data'),
    path('api/manage-doctor', views.manage_doctor, name='manage_doctor'),
    path('api/update-admin-credentials', views.update_admin_credentials, name='update_admin_credentials'),
    path('api/get-doctors', views.get_doctors, name='get_doctors'),
    path('api/update-appointment', views.update_appointment, name='update_appointment'),
    path('api/submit-rating/', views.submit_rating, name='submit_rating'),
    path('api/get-ratings/', views.get_ratings, name='get_ratings'),
    path('api/update-rating/', views.update_rating, name='update_rating'),
    path('api/delete-rating/', views.delete_rating, name='delete_rating'),
    path('api/manage-report', views.manage_report, name='manage_report'),
    path('api/get-all-reports', views.get_all_reports, name='get_all_reports'),
    path('api/get-user-reports', views.get_user_reports, name='get_user_reports'),
    path('download-report/<int:report_id>/', views.download_report_pdf, name='download_report_pdf'),
    path('api/get-all-users', views.get_all_users, name='get_all_users'),
    path('api/get-all-doctors', views.get_all_doctors, name='get_all_doctors'),
]
