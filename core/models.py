
from django.db import models
from django.utils import timezone

class User(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    age = models.IntegerField(null=True, blank=True)
    blood_type = models.CharField(max_length=10, null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    profile_pic = models.ImageField(upload_to='uploads/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email

class Appointment(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    doctor = models.CharField(max_length=255)
    appointment_date = models.DateTimeField()
    
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('Confirmed', 'Confirmed'),
        ('Rescheduled', 'Rescheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Scheduled')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'appointments'

    def __str__(self):
        return f"{self.name} - {self.doctor}"

class Contact(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contacts'

    def __str__(self):
        return self.email

class LoginHistory(models.Model):
    email = models.EmailField()
    password = models.CharField(max_length=255) # Storing hashed pwd as per legacy code logic (weird but replicating)
    login_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'login_history'

    def __str__(self):
        return f"{self.email} - {self.login_time}"

class Admin(models.Model):
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)

    class Meta:
        db_table = 'admins'

    def __str__(self):
        return self.username

class Doctor(models.Model):
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    image = models.ImageField(upload_to='doctors/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'doctors'

    def __str__(self):
        return f"{self.name} - {self.specialization}"

class Rating(models.Model):
    doctor_name = models.CharField(max_length=255)
    user_email = models.EmailField()
    user_name = models.CharField(max_length=255)
    rating = models.IntegerField()  # 1-5 stars
    review_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ratings'

    def __str__(self):
        return f"{self.user_name} rated {self.doctor_name} - {self.rating} stars"

class Report(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    doctor_name = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True) # Making optional as we have specific fields now
    report_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    # New Fields for Enhanced Dental Report
    chief_complaint = models.TextField(blank=True, null=True)
    clinical_findings = models.TextField(blank=True, null=True)
    oral_hygiene = models.CharField(max_length=50, blank=True, null=True) # Good, Fair, Poor
    teeth_condition = models.TextField(blank=True, null=True)
    gums = models.CharField(max_length=50, blank=True, null=True) # Healthy, Bleeding, etc.
    diagnosis = models.TextField(blank=True, null=True)
    treatment_plan = models.TextField(blank=True, null=True)
    medications = models.TextField(blank=True, null=True)
    advice = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'reports'

    def __str__(self):
        return f"Report for {self.user.email} - {self.title}"
