provider "aws" {
  region = "us-west-2"
}

terraform {
  backend "s3" {
    bucket = "luischacon-tf-states"
    region = "us-east-1"
  }
}
