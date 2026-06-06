# SES domain identity with Easy DKIM. Publishing the three DKIM CNAMEs both
# proves domain ownership (verifies the identity) and signs outgoing mail.
resource "aws_sesv2_email_identity" "blog" {
  email_identity = local.email_domain

  dkim_signing_attributes {
    next_signing_key_length = "RSA_2048_BIT"
  }
}

# Send-only IAM user; the SMTP password is derived from its access key.
resource "aws_iam_user" "ses" {
  name = "blog-ses-smtp"
}

resource "aws_iam_user_policy" "ses_send" {
  name = "blog-ses-send"
  user = aws_iam_user.ses.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ses:SendRawEmail", "ses:SendEmail"]
      Resource = "*"
    }]
  })
}

resource "aws_iam_access_key" "ses" {
  user = aws_iam_user.ses.name
}
