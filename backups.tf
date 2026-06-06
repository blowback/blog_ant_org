# Off-box backups to S3. The bucket lives in the same region as SES (var.aws_region).

resource "random_id" "backup_bucket" {
  byte_length = 4
}

resource "aws_s3_bucket" "backups" {
  bucket = "blog-backups-${random_id.backup_bucket.hex}"
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket                  = aws_s3_bucket.backups.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule {
    id     = "expire-old-backups"
    status = "Enabled"
    filter {} # all objects
    expiration {
      days = var.backup_retention_days
    }
  }
}

# Dedicated, least-privilege user for the backup script on the server.
# No DeleteObject: a compromised server can write backups but cannot erase
# history. Expiry is handled by the lifecycle rule above, not by the box.
resource "aws_iam_user" "backup" {
  name = "blog-backup"
}

resource "aws_iam_user_policy" "backup" {
  name = "blog-backup-s3"
  user = aws_iam_user.backup.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ListBucket"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.backups.arn
      },
      {
        Sid      = "ReadWriteObjects"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetObject"]
        Resource = "${aws_s3_bucket.backups.arn}/*"
      }
    ]
  })
}

resource "aws_iam_access_key" "backup" {
  user = aws_iam_user.backup.name
}
