from django.db import models

class Workshop(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateField()
    location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class WorkshopImage(models.Model):
    workshop = models.ForeignKey(Workshop, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='workshop_images/')

    def __str__(self):
        return f"Image for {self.workshop.title}"
