locals {
  email_domain = var.email_domain != "" ? var.email_domain : var.blog_domain
  mail_from    = var.mail_from != "" ? var.mail_from : "noreply@${local.email_domain}"

  # The entire .env as a single flat string. No here-doc, no YAML block, no
  # significant whitespace anywhere. Edit by adding/removing list entries.
  env_file = join("\n", [
    "BLOG_DOMAIN=${var.blog_domain}",
    "COMMENTS_DOMAIN=${var.comments_domain}",
    "ACME_EMAIL=${var.acme_email}",
    "MYSQL_ROOT_PASSWORD=${random_password.mysql_root.result}",
    "GHOST_DB_PASSWORD=${random_password.ghost_db.result}",
    "REMARK_SECRET=${random_password.remark_secret.result}",
    "SMTP_HOST=email-smtp.${var.aws_region}.amazonaws.com",
    "SMTP_USER=${aws_iam_access_key.ses.id}",
    "SMTP_PASS=${aws_iam_access_key.ses.ses_smtp_password_v4}",
    "MAIL_FROM=${local.mail_from}",
    "GH_CID=${var.gh_cid}",
    "GH_CSEC=${var.gh_csec}",
    "REMARK_ADMIN_ID=${var.remark_admin_id}",
    "AWS_DEFAULT_REGION=${var.aws_region}",
    "AWS_REGION=${var.aws_region}",
    "AWS_ACCESS_KEY_ID=${aws_iam_access_key.backup.id}",
    "AWS_SECRET_ACCESS_KEY=${aws_iam_access_key.backup.secret}",
    "BACKUP_BUCKET=${aws_s3_bucket.backups.id}",
    "", # trailing newline
  ])

  cloud_init = templatefile("${path.module}/cloud-init.yaml.tftpl", {
    env_file = local.env_file
    repo_url = var.repo_url
  })
}

# ---- Generated secrets (live only in the server's /opt/blog/.env) ----
resource "random_password" "mysql_root" {
  length  = 32
  special = false
}

resource "random_password" "ghost_db" {
  length  = 32
  special = false
}

resource "random_password" "remark_secret" {
  length  = 48
  special = false
}

# ---- SSH key ----
resource "hcloud_ssh_key" "admin" {
  name       = "blog-admin"
  public_key = var.ssh_public_key
}

# ---- Firewall: 80/443 open to the world, SSH locked to your IP ----
resource "hcloud_firewall" "blog" {
  name = "blog-fw"

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "22"
    source_ips = [var.ssh_source_cidr]
  }
  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
  rule {
    direction  = "in"
    protocol   = "udp"
    port       = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
}

# ---- The server ----
resource "hcloud_server" "blog" {
  name         = "blog"
  server_type  = var.server_type
  image        = "ubuntu-24.04"
  location     = var.location
  ssh_keys     = [hcloud_ssh_key.admin.id]
  firewall_ids = [hcloud_firewall.blog.id]
  user_data    = local.cloud_init

  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }

  labels = {
    role = "blog"
  }
}
