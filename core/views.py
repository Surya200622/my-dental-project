
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.conf import settings
from .models import User, Appointment, Contact, LoginHistory, Admin, Doctor, Rating, Report
import json
import os
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from email.mime.image import MIMEImage
from django.contrib.staticfiles import finders
import threading


def index(request):
    return render(request, 'core/index.html')

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:
            name = request.POST.get('name')
            email = request.POST.get('email')
            password = request.POST.get('password')
            password_confirm = request.POST.get('passwordConfirm')
            age = request.POST.get('age')
            blood_group = request.POST.get('bloodGroup')
            gender = request.POST.get('gender')
            profile_pic = request.FILES.get('profilePic')

            if not all([name, email, password, password_confirm]):
                return JsonResponse({'status': 'failed', 'message': 'All fields are required'})

            if password != password_confirm:
                return JsonResponse({'status': 'failed', 'message': 'Passwords do not match'})

            if User.objects.filter(email=email).exists():
                return JsonResponse({'status': 'failed', 'message': 'Email already exists. Please use a different email.'})

            hashed_password = make_password(password)
            
            user = User(
                name=name,
                email=email,
                password=hashed_password,
                age=age if age else None,
                blood_type=blood_group if blood_group else None,
                gender=gender if gender else None,
                profile_pic=profile_pic
            )
            user.save()

            # Send Welcome Email
            try:
                subject = "Welcome to Dental Experts - Your Credentials"
                html_content = f"""
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h1 style="color: #00b8b8;">Welcome, {name}!</h1>
                        <p>Thank you for registering with Dental Experts.</p>
                        <p>Here are your account details:</p>
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Email:</strong> {email}</p>
                            <p><strong>Password:</strong> {password}</p>
                        </div>
                        <p>Please keep this information safe or change your password after logging in.</p>
                        <p>Best regards,<br>Dental Experts Team</p>
                    </div>
                """
                text_content = strip_tags(html_content)
                msg = EmailMultiAlternatives(subject, text_content, settings.EMAIL_HOST_USER, [email])
                msg.attach_alternative(html_content, "text/html")
                msg.send()
                print(f"Welcome email sent to {email}")
            except Exception as e:
                print(f"Error sending welcome email: {e}")

            return JsonResponse({'status': 'success', 'message': 'Registration successful!'})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'failed', 'message': 'Invalid method'})

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            login_type = data.get('type', 'user') # 'user' or 'admin'
            
            if login_type == 'admin':
                username = data.get('username')
                password = data.get('password')
                
                if not all([username, password]):
                    return JsonResponse({'status': 'failed', 'message': 'Username and password required'})
                
                try:
                    admin = Admin.objects.get(username__iexact=username)
                    if check_password(password, admin.password):
                         return JsonResponse({
                            'status': 'success', 
                            'message': 'Admin login successful',
                            'role': 'admin',
                            'user': {'name': admin.username}
                        })
                    else:
                        return JsonResponse({'status': 'failed', 'message': 'Incorrect password'})
                except Admin.DoesNotExist:
                     return JsonResponse({'status': 'failed', 'message': 'Admin not found'})
            
            else:
                # User Login
                email = data.get('email')
                password = data.get('password')

                if not all([email, password]):
                    return JsonResponse({'status': 'failed', 'message': 'Email and password are required'})

                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    return JsonResponse({'status': 'failed', 'message': 'Email not found. Please sign up first.'})

                if not check_password(password, user.password):
                     return JsonResponse({'status': 'failed', 'message': 'Incorrect password'})

                # Log login
                LoginHistory.objects.create(email=email, password=user.password)

                return JsonResponse({
                    'status': 'success',
                    'message': 'Login successful',
                    'role': 'user',
                    'user': {
                        'id': user.id,
                        'name': user.name,
                        'email': user.email,
                        'profile_pic': user.profile_pic.url if user.profile_pic else None
                    }
                })

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'failed', 'message': 'Invalid method'})

@csrf_exempt
def appointment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            phone = data.get('number')
            doctor = data.get('doctor')
            appointment_date = data.get('appointmentDate')

            if not all([name, email, phone, doctor, appointment_date]):
                return JsonResponse({'status': 'error', 'message': 'All fields are required'})

            Appointment.objects.create(
                name=name,
                email=email,
                phone=phone,
                doctor=doctor,
                appointment_date=appointment_date
            )
            
            # Send Confirmation Email with Attachment
            try:
                subject = "Appointment Confirmation - Dental Experts"
                html_content = f"""
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #00b8b8;">Appointment Confirmed!</h2>
                        <p>Dear {name},</p>
                        <p>Your appointment has been successfully booked.</p>
                        
                        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #00b8b8; margin: 20px 0;">
                            <p><strong>Doctor:</strong> {doctor}</p>
                            <p><strong>Date & Time:</strong> {appointment_date}</p>
                            <p><strong>Patient Phone:</strong> {phone}</p>
                        </div>

                        <p>We look forward to seeing you. If you have any questions, please contact us.</p>
                        
                        <p><strong>Special Offers for you:</strong></p>
                        <img src="cid:offerImage" alt="Dental Experts Offers" style="max-width: 100%; height: auto; border-radius: 8px;">
                        
                        <br><br>
                        <p>Best Regards,<br><strong>Dental Experts Team</strong></p>
                    </div>
                """
                text_content = strip_tags(html_content)
                msg = EmailMultiAlternatives(subject, text_content, settings.EMAIL_HOST_USER, [email])
                msg.attach_alternative(html_content, "text/html")

                # Attach Image
                image_path = finders.find('core/images/imageTemplate.png')
                if image_path:
                    with open(image_path, 'rb') as f:
                        img_data = f.read()
                        image = MIMEImage(img_data)
                        image.add_header('Content-ID', '<offerImage>')
                        image.add_header('Content-Disposition', 'inline', filename='offers.png')
                        msg.attach(image)
                
                msg.send()
                print(f"Appointment confirmation email sent to {email}")

            except Exception as e:
                print(f"Failed to send appointment email: {e}")

            return JsonResponse({'status': 'success', 'message': 'Appointment booked successfully! Confirmation email sent.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'failed', 'message': 'Invalid method'})

@csrf_exempt
def contact(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('contactName')
            email = data.get('contactEmail')
            phone = data.get('contactNumber')
            message = data.get('contactMessage')

            if not all([name, email, phone, message]):
                 return JsonResponse({'status': 'failed', 'message': 'All fields are required'})

            Contact.objects.create(
                name=name,
                email=email,
                phone=phone,
                message=message
            )

            # Send Emails (Admin + Auto-reply)
            try:
                # 1. Admin Notification
                admin_subject = f"New Inquiry from {name}"
                admin_html = f"""
                    <h3>New Contact Request</h3>
                    <p><strong>Name:</strong> {name}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Phone:</strong> {phone}</p>
                    <p><strong>Message:</strong> {message}</p>
                """
                admin_msg = EmailMultiAlternatives(admin_subject, strip_tags(admin_html), settings.EMAIL_HOST_USER, [settings.EMAIL_HOST_USER]) # Sending to self as admin
                admin_msg.attach_alternative(admin_html, "text/html")
                admin_msg.send()

                # 2. Patient Auto-reply
                reply_subject = "Welcome to Dental Experts - Special Offers Inside!"
                reply_html = f"""
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #00b8b8;">Thank you for getting in touch, {name}!</h2>
                        <p>We have received your message and will call you back shortly at <strong>{phone}</strong>.</p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        
                        <h3>Why Choose Dental Experts?</h3>
                        <ul>
                            <li>Advanced Technology & Painless Treatments</li>
                            <li>Experienced Team of Specialists</li>
                            <li>Comprehensive Care for the Whole Family</li>
                        </ul>

                        <p><strong>Check out our latest offers below:</strong></p>
                        <img src="cid:offerImage" alt="Dental Experts Offers" style="max-width: 100%; height: auto; border-radius: 8px;">
                        
                        <br><br>
                        <p>Best Regards,<br><strong>Dental Experts Team</strong></p>
                    </div>
                """
                reply_msg = EmailMultiAlternatives(reply_subject, strip_tags(reply_html), settings.EMAIL_HOST_USER, [email])
                reply_msg.attach_alternative(reply_html, "text/html")

                # Attach Image
                image_path = finders.find('core/images/imageTemplate.png')
                if image_path:
                    with open(image_path, 'rb') as f:
                        img_data = f.read()
                        image = MIMEImage(img_data)
                        image.add_header('Content-ID', '<offerImage>')
                        image.add_header('Content-Disposition', 'inline', filename='offers.png')
                        reply_msg.attach(image)
                
                reply_msg.send()

            except Exception as e:
                print(f"Email send error: {e}")

            return JsonResponse({'status': 'success', 'message': 'Message sent! We checked your inbox for offers.'})
        except Exception as e:
             return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'failed', 'message': 'Invalid method'})

def user_profile(request):
    email = request.GET.get('email')
    if not email:
        return JsonResponse({'status': 'failed', 'message': 'Email required'})
    
    try:
        user = User.objects.get(email=email)
        user_data = {
            'name': user.name,
            'email': user.email,
            'age': user.age,
            'blood_group': user.blood_type,
            'gender': user.gender,
            'profile_pic': user.profile_pic.url if user.profile_pic else None
        }
        return JsonResponse({'status': 'success', 'user': user_data})
    except User.DoesNotExist:
         return JsonResponse({'status': 'failed', 'message': 'User not found'})

@csrf_exempt
def update_profile(request):
    if request.method == 'POST':
        try:
            email = request.POST.get('email')
            name = request.POST.get('name')
            
            if not email or not name:
                return JsonResponse({'status': 'failed', 'message': 'Name and Email required'})

            try:
                user = User.objects.get(email=email)
                user.name = name
                user.age = request.POST.get('age')
                user.blood_type = request.POST.get('bloodGroup')
                user.gender = request.POST.get('gender')
                
                if 'profilePic' in request.FILES:
                    user.profile_pic = request.FILES['profilePic']
                
                user.save()
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Profile updated successfully',
                    'newPic': user.profile_pic.url if user.profile_pic else None
                })
            except User.DoesNotExist:
                return JsonResponse({'status': 'failed', 'message': 'User not found'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'failed', 'message': 'Invalid method'})

def my_appointments(request):
    email = request.GET.get('email')
    if not email:
        return JsonResponse({'status': 'failed', 'message': 'Email required'})

    appointments = Appointment.objects.filter(email=email).order_by('-appointment_date').values()
    return JsonResponse({'status': 'success', 'appointments': list(appointments)})

@csrf_exempt
def admin_dashboard_data(request):
    try:
        users_count = User.objects.count()
        appointments_count = Appointment.objects.count()
        doctors_count = Doctor.objects.count()
        
        users_data = list(User.objects.values('name', 'email', 'age', 'gender', 'blood_type', 'profile_pic'))
        appointments = list(Appointment.objects.values(
            'id', 'name', 'email', 'phone', 'doctor', 
            'appointment_date', 'status', 'created_at'
        ).order_by('-appointment_date'))
        


        doctors = list(Doctor.objects.values('id', 'name', 'specialization')) 
        
        return JsonResponse({
            'status': 'success',
            'stats': {
                'users': users_count,
                'appointments': appointments_count,
                'doctors': doctors_count
            },
            'users': users_data,
            'appointments': appointments,
            'doctors': doctors
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})

@csrf_exempt
def manage_doctor(request):
    if request.method == 'POST':
        try:
            # Check for delete action
            if request.GET.get('action') == 'delete':
                data = json.loads(request.body)
                doctor_id = data.get('id')
                Doctor.objects.filter(id=doctor_id).delete()
                return JsonResponse({'status': 'success', 'message': 'Doctor removed'})
            
            # Add Doctor
            # Since we accept image, we expect FormData, not JSON body for ADD
            # But the request might be multipart/form-data
            
            name = request.POST.get('name')
            specialization = request.POST.get('specialization')
            # image = request.FILES.get('image') # Optional
            
            if not name or not specialization:
                return JsonResponse({'status': 'failed', 'message': 'Name and Specialization required'})

            Doctor.objects.create(name=name, specialization=specialization)
            return JsonResponse({'status': 'success', 'message': 'Doctor added successfully'})
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
            
    return JsonResponse({'status': 'failed', 'message': 'Invalid method'})

@csrf_exempt
def update_admin_credentials(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_username = data.get('username')
            new_password = data.get('password')
            current_user_id = data.get('current_username') # Verify who is changing
            
            # Simplified security: just update
            if not new_username or not new_password:
                return JsonResponse({'status': 'failed', 'message': 'Username and Password required'})

            # Find the admin (assuming single admin or identifying by session/current username)
            # For now, we update the first admin or specific one.
            # Let's find by current_username if provided, else just get the first one?
            # Better: The user is logged in as 'dentalexperts' initially.
            
            # Using filter update
            if current_user_id:
                admins = Admin.objects.filter(username=current_user_id)
            else:
                 admins = Admin.objects.all()
                 
            if admins.exists():
                admin = admins.first()
                admin.username = new_username
                admin.password = make_password(new_password)
                admin.save()
                return JsonResponse({'status': 'success', 'message': 'Credentials updated. Please login again.'})
            else:
                return JsonResponse({'status': 'failed', 'message': 'Admin not found'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'failed', 'message': 'Invalid method'})

def get_doctors(request):
    doctors = list(Doctor.objects.values('id', 'name', 'specialization'))
    return JsonResponse({'status': 'success', 'doctors': doctors})

@csrf_exempt
def update_appointment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            appt_id = data.get('id')
            new_status = data.get('status')
            new_date = data.get('date')
            new_doctor = data.get('doctor')
            

            
            if not appt_id:
                return JsonResponse({'status': 'failed', 'message': 'ID required'})

            appt = Appointment.objects.get(id=appt_id)
            
            # Explicitly update fields
            if new_status is not None:
                cleaned_status = new_status.strip()
                if not cleaned_status:
                    cleaned_status = 'Scheduled'
                appt.status = cleaned_status
                
            if new_doctor: 
                appt.doctor = new_doctor
            if new_date:
                # Ensure date is parsed correctly
                from django.utils.dateparse import parse_datetime
                from django.utils import timezone
                parsed_date = parse_datetime(new_date)
                if parsed_date:
                    # Make aware if naive and USE_TZ is True
                    if settings.USE_TZ and timezone.is_naive(parsed_date):
                        parsed_date = timezone.make_aware(parsed_date)
                    appt.appointment_date = parsed_date
            
            appt.save()
            appt.refresh_from_db() # Verify persistence
            
            # Send Email based on status in background
            try:
                if appt.status in ['Rescheduled', 'Completed']:
                    email_thread = threading.Thread(
                        target=send_appointment_status_email,
                        args=(appt.status, appt.name, appt.email, appt.doctor, appt.appointment_date, appt.phone)
                    )
                    email_thread.start()
                    print(f"Started email background thread for {appt.email}")
            except Exception as e:
                print(f"Failed to start status update email thread: {e}")
            
            return JsonResponse({
                'status': 'success', 
                'message': 'Appointment updated successfully',
                'updated_data': {
                    'status': appt.status,
                    'doctor': appt.doctor,
                    'date': str(appt.appointment_date)
                }
            })
        except Appointment.DoesNotExist:
             return JsonResponse({'status': 'failed', 'message': 'Appointment not found'})
        except Exception as e:
             return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'failed', 'message': 'Invalid method'})



def send_appointment_status_email(status, name, email, doctor, appointment_date, phone):
    try:
        formatted_date = str(appointment_date) # Default fallback
        if status == 'Rescheduled' and hasattr(appointment_date, 'strftime'):
            formatted_date = appointment_date.strftime('%B %d, %Y at %I:%M %p')
        elif status == 'Completed' and hasattr(appointment_date, 'strftime'):
             formatted_date = appointment_date.strftime('%B %d, %Y')
             
        if status == 'Rescheduled':
            subject = "Appointment Rescheduled - Dental Experts"
            html_content = f'''
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #00b8b8;">Appointment Rescheduled!</h2>
                    <p>Dear {name},</p>
                    <p>Your appointment has been rescheduled.</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #00b8b8; margin: 20px 0;">
                        <p><strong>Doctor:</strong> {doctor}</p>
                        <p><strong>New Date & Time:</strong> {formatted_date}</p>
                        <p><strong>Patient Phone:</strong> {phone}</p>
                    </div>

                    <p>We look forward to seeing you. If you have any questions, please contact us.</p>
                    
                    <p><strong>Special Offers for you:</strong></p>
                    <img src="cid:offerImage" alt="Dental Experts Offers" style="max-width: 100%; height: auto; border-radius: 8px;">
                    
                    <br><br>
                    <p>Best Regards,<br><strong>Dental Experts Team</strong></p>
                </div>
            '''
            
        elif status == 'Completed':
            subject = "Appointment Completed - Dental Experts"
            html_content = f'''
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #00b8b8;">Appointment Completed</h2>
                    <p>Dear {name},</p>
                    <p>Thank you for visiting Dental Experts. We hope you had a pleasant experience.</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #00b8b8; margin: 20px 0;">
                        <p><strong>Doctor:</strong> {doctor}</p>
                        <p><strong>Date Visited:</strong> {formatted_date}</p>
                    </div>

                    <p>Your feedback is valuable to us.</p>
                    
                    <p><strong>Special Offers for your next visit:</strong></p>
                    <img src="cid:offerImage" alt="Dental Experts Offers" style="max-width: 100%; height: auto; border-radius: 8px;">
                    
                    <br><br>
                    <p>Best Regards,<br><strong>Dental Experts Team</strong></p>
                </div>
            '''
        else:
            return

        text_content = strip_tags(html_content)
        msg = EmailMultiAlternatives(subject, text_content, settings.EMAIL_HOST_USER, [email])
        msg.attach_alternative(html_content, "text/html")

        # Attach Image
        image_path = finders.find('core/images/imageTemplate.png')
        if image_path:
            with open(image_path, 'rb') as f:
                img_data = f.read()
                image = MIMEImage(img_data)
                image.add_header('Content-ID', '<offerImage>')
                image.add_header('Content-Disposition', 'inline', filename='offers.png')
                msg.attach(image)
        
        msg.send()
        print(f"{status} email sent to {email}")

    except Exception as e:
        print(f"Failed to send status update email: {e}")

@csrf_exempt
def submit_rating(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            doctor_name = data.get('doctor_name')
            user_email = data.get('user_email')
            user_name = data.get('user_name')
            rating = data.get('rating')
            review_text = data.get('review_text')

            if not all([doctor_name, user_email, user_name, rating, review_text]):
                return JsonResponse({'status': 'failed', 'message': 'All fields are required'})

            # Validate rating is between 1 and 5
            try:
                rating = int(rating)
                if rating < 1 or rating > 5:
                    return JsonResponse({'status': 'failed', 'message': 'Rating must be between 1 and 5'})
            except ValueError:
                return JsonResponse({'status': 'failed', 'message': 'Invalid rating value'})

            Rating.objects.create(
                doctor_name=doctor_name,
                user_email=user_email,
                user_name=user_name,
                rating=rating,
                review_text=review_text
            )

            return JsonResponse({'status': 'success', 'message': 'Rating submitted successfully!'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'failed', 'message': 'Invalid method'})

def get_ratings(request):
    try:
        ratings = Rating.objects.all().order_by('-created_at').values(
            'id', 'doctor_name', 'user_name', 'user_email', 'rating', 'review_text', 'created_at'
        )
        return JsonResponse({'status': 'success', 'ratings': list(ratings)})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})

@csrf_exempt
def update_rating(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            rating_id = data.get('rating_id')
            user_email = data.get('user_email')
            new_rating = data.get('rating')
            new_review_text = data.get('review_text')
            
            if not all([rating_id, user_email, new_rating, new_review_text]):
                return JsonResponse({'status': 'failed', 'message': 'All fields are required'})
            
            try:
                rating_obj = Rating.objects.get(id=rating_id, user_email=user_email)
                rating_obj.rating = int(new_rating)
                rating_obj.review_text = new_review_text
                rating_obj.save()
                
                return JsonResponse({'status': 'success', 'message': 'Rating updated successfully!'})
            except Rating.DoesNotExist:
                return JsonResponse({'status': 'failed', 'message': 'Rating not found or you do not have permission to edit'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'failed', 'message': 'Invalid method'})

@csrf_exempt
def delete_rating(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            rating_id = data.get('rating_id')
            user_email = data.get('user_email')
            is_admin = data.get('is_admin', False)
            
            if not rating_id:
                return JsonResponse({'status': 'failed', 'message': 'Rating ID required'})
            
            try:
                if is_admin:
                    # Admin can delete any rating
                    rating_obj = Rating.objects.get(id=rating_id)
                else:
                    # User can only delete their own rating
                    rating_obj = Rating.objects.get(id=rating_id, user_email=user_email)
                
                rating_obj.delete()
                return JsonResponse({'status': 'success', 'message': 'Rating deleted successfully!'})
            except Rating.DoesNotExist:
                return JsonResponse({'status': 'failed', 'message': 'Rating not found or you do not have permission to delete'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'failed', 'message': 'Invalid method'})

# --- REPORT MANAGEMENT ---

@csrf_exempt
def manage_report(request):
    if request.method == 'POST':
        try:
            # Check for delete action (GET param inside POST request logic per previous implementation)
            if request.GET.get('action') == 'delete':
                data = json.loads(request.body)
                report_id = data.get('id')
                Report.objects.filter(id=report_id).delete()
                return JsonResponse({'status': 'success', 'message': 'Report deleted'})
            
            # Create or Update
            data = json.loads(request.body)
            report_id = data.get('id')
            user_email = data.get('user_email')
            title = data.get('title')
            doctor_name = data.get('doctor_name')
            report_date = data.get('report_date')
            
            # Enhanced Fields
            chief_complaint = data.get('chief_complaint')
            clinical_findings = data.get('clinical_findings')
            oral_hygiene = data.get('oral_hygiene')
            teeth_condition = data.get('teeth_condition')
            gums = data.get('gums')
            diagnosis = data.get('diagnosis')
            treatment_plan = data.get('treatment_plan')
            medications = data.get('medications')
            advice = data.get('advice')

            if not all([user_email, title, doctor_name]): # Reduced strictness, other fields optional
                 return JsonResponse({'status': 'failed', 'message': 'Basic fields (Email, Doctor, Title) are required'})

            try:
                user = User.objects.get(email=user_email)
            except User.DoesNotExist:
                return JsonResponse({'status': 'failed', 'message': 'User not found'})

            defaults = {
                'user': user,
                'title': title,
                'doctor_name': doctor_name,
                'report_date': report_date,
                'chief_complaint': chief_complaint,
                'clinical_findings': clinical_findings,
                'oral_hygiene': oral_hygiene,
                'teeth_condition': teeth_condition,
                'gums': gums,
                'diagnosis': diagnosis,
                'treatment_plan': treatment_plan,
                'medications': medications,
                'advice': advice
            }

            if report_id:
                # Update
                report = Report.objects.get(id=report_id)
                for key, value in defaults.items():
                    setattr(report, key, value)
                report.save()
                return JsonResponse({'status': 'success', 'message': 'Report updated successfully'})
            else:
                # Create
                Report.objects.create(
                    **defaults
                )
                return JsonResponse({'status': 'success', 'message': 'Report created successfully'})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
            
    return JsonResponse({'status': 'failed', 'message': 'Invalid method'})

def get_all_reports(request):
    try:
        # Fetching all fields for Admin edit form, explicitly including user details
        reports = Report.objects.all().order_by('-created_at').values(
            'id', 'user__email', 'user__name', 'doctor_name', 'title', 'report_date', 'created_at',
            'chief_complaint', 'clinical_findings', 'oral_hygiene', 'teeth_condition', 
            'gums', 'diagnosis', 'treatment_plan', 'medications', 'advice'
        )
        return JsonResponse({'status': 'success', 'reports': list(reports)})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})

def get_user_reports(request):
    email = request.GET.get('email')
    if not email:
        return JsonResponse({'status': 'failed', 'message': 'Email required'})
    
    try:
        user = User.objects.get(email=email)
        reports = Report.objects.filter(user=user).order_by('-report_date').values(
            'id', 'doctor_name', 'title', 'report_date'
        )
        return JsonResponse({'status': 'success', 'reports': list(reports)})
    except User.DoesNotExist:
         return JsonResponse({'status': 'failed', 'message': 'User not found'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})

from xhtml2pdf import pisa
from io import BytesIO
from django.http import HttpResponse
from django.template.loader import get_template

def download_report_pdf(request, report_id):
    try:
        report = Report.objects.get(id=report_id)
        
        # HTML Template for Detailed Dental Report
        html_string = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Helvetica, Arial, sans-serif; color: #333; }}
                .header {{ border-bottom: 2px solid #00b8b8; padding-bottom: 20px; margin-bottom: 20px; }}
                .header h1 {{ color: #00b8b8; margin: 0; font-size: 24px; }}
                .header p {{ color: #666; font-size: 12px; margin: 5px 0 0; }}
                
                .patient-info {{ width: 100%; margin-bottom: 20px; }}
                .patient-info td {{ padding: 5px; }}
                .label {{ font-weight: bold; color: #555; width: 120px; }}
                
                .section {{ margin-bottom: 15px; page-break-inside: avoid; }}
                .section-title {{ background: #f0fdfd; color: #00b8b8; padding: 5px 10px; font-weight: bold; border-left: 4px solid #00b8b8; margin-bottom: 8px; }}
                .section-content {{ padding: 0 10px; font-size: 14px; line-height: 1.4; }}
                
                .small-table {{ width: 100%; margin-bottom: 5px; }}
                .small-table td {{ padding: 5px; }}
                
                .footer {{ border-top: 1px solid #ddd; margin-top: 30px; padding-top: 10px; text-align: center; font-size: 10px; color: #999; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Dental Examination Report</h1>
                <p>Dental Experts Clinic | www.dentalexperts.com</p>
            </div>
            
            <table class="patient-info">
                <tr>
                    <td class="label">Patient Name:</td>
                    <td>{report.user.name} ({report.user.email})</td>
                    <td class="label">Date:</td>
                    <td>{report.report_date}</td>
                </tr>
                <tr>
                    <td class="label">Doctor:</td>
                    <td>{report.doctor_name}</td>
                    <td class="label">Report ID:</td>
                    <td>#{report.id}</td>
                </tr>
            </table>

            <div class="section">
                <div class="section-title">Chief Complaint</div>
                <div class="section-content">{report.chief_complaint or 'N/A'}</div>
            </div>

            <div class="section">
                <div class="section-title">Clinical Findings</div>
                <div class="section-content">{report.clinical_findings or 'N/A'}</div>
            </div>

            <table class="small-table">
                <tr>
                    <td width="50%">
                        <div class="section">
                            <div class="section-title">Oral Hygiene</div>
                            <div class="section-content">{report.oral_hygiene or 'N/A'}</div>
                        </div>
                    </td>
                    <td width="50%">
                        <div class="section">
                            <div class="section-title">Gums</div>
                            <div class="section-content">{report.gums or 'N/A'}</div>
                        </div>
                    </td>
                </tr>
            </table>

            <div class="section">
                <div class="section-title">Teeth Condition</div>
                <div class="section-content">{report.teeth_condition or 'N/A'}</div>
            </div>

            <div class="section">
                <div class="section-title">Diagnosis</div>
                <div class="section-content">{report.diagnosis or 'N/A'}</div>
            </div>

            <div class="section">
                <div class="section-title">Treatment Plan</div>
                <div class="section-content">{report.treatment_plan or 'N/A'}</div>
            </div>

            <div class="section">
                <div class="section-title">Medications</div>
                <div class="section-content">{report.medications or 'N/A'}</div>
            </div>

            <div class="section">
                <div class="section-title">Advice / Remarks</div>
                <div class="section-content">{report.advice or 'N/A'}</div>
            </div>

            <div class="footer">
                Generated securely on {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}
            </div>
        </body>
        </html>
        """

        # Generate PDF
        result = BytesIO()
        pdf = pisa.pisaDocument(BytesIO(html_string.encode("UTF-8")), result)
        
        if not pdf.err:
            response = HttpResponse(result.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="Treatment_Report_{report.user.name}.pdf"'
            return response
        else:
            return HttpResponse("Error generating PDF", status=500)

    except Report.DoesNotExist:
        return HttpResponse("Report not found", status=404)
    except Exception as e:
        return HttpResponse(f"Error: {str(e)}", status=500)

def get_all_users(request):
    try:
        users = User.objects.all().values('email', 'name')
        return JsonResponse({'status': 'success', 'users': list(users)})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})

def get_all_doctors(request):
    try:
        doctors = Doctor.objects.all().values('name')
        return JsonResponse({'status': 'success', 'doctors': list(doctors)})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})
