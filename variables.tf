variable "hcloud_token" {
  description = "Hetzner Cloud API token (or set HCLOUD_TOKEN in the environment)."
  type        = string
  sensitive   = true
  default     = null
}

variable "aws_region" {
  description = "AWS region for SES. eu-west-2 = London, eu-west-1 = Ireland."
  type        = string
  default     = "eu-west-2"
}

variable "blog_domain" {
  description = "Domain for the Ghost blog, e.g. blog.example.com"
  type        = string
}

variable "comments_domain" {
  description = "Domain for Remark42, e.g. comments.example.com"
  type        = string
}

variable "email_domain" {
  description = "Domain to verify in SES and send 'from'. Defaults to blog_domain. Often the apex (example.com)."
  type        = string
  default     = ""
}

variable "mail_from" {
  description = "Ghost 'from' address. Defaults to noreply@<email_domain>. Its domain must be the SES-verified one."
  type        = string
  default     = ""
}

variable "acme_email" {
  description = "Email for Let's Encrypt / Caddy ACME registration."
  type        = string
}

variable "ssh_public_key" {
  description = "Your SSH public key (contents, not a path)."
  type        = string
}

variable "ssh_source_cidr" {
  description = "CIDR allowed to reach SSH (port 22). Use your IP/32, e.g. 203.0.113.4/32."
  type        = string
}

variable "server_type" {
  description = "Hetzner server type. cx23 = 2 vCPU / 4 GB / 40 GB."
  type        = string
  default     = "cx23"
}

variable "location" {
  description = "Hetzner location: fsn1/nbg1 (Germany), hel1 (Finland), ash/hil (US)."
  type        = string
  default     = "fsn1"
}

variable "gh_cid" {
  description = "GitHub OAuth app client ID for Remark42."
  type        = string
  default     = ""
}

variable "gh_csec" {
  description = "GitHub OAuth app client secret for Remark42."
  type        = string
  sensitive   = true
  default     = ""
}

variable "remark_admin_id" {
  description = "Remark42 admin user ID (github_<hash>)."
  type        = string
  default     = ""
}

variable "backup_retention_days" {
  description = "Days to keep backups in S3 before lifecycle expiry."
  type        = number
  default     = 30
}
