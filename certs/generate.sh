#!/bin/bash
set -e

cd "$(dirname "$0")"

HTTPS_ALGO="rsa:4096"
DURATION_DAYS=365

DEFAULT_C="RU"
DEFAULT_ST="Moscow"
DEFAULT_L="Moscow"
DEFAULT_O="Personal"
DEFAULT_OU="Personal"
DEFAULT_EMAIL="kristinalysenko3003@gmail.com"
DEFAULT_CN="localhost"

function cleanup {
    directories_to_clean=(
        "CA/"
        "server/"
    )

    masks_to_remove=(
        "*.crt"
        "*.csr"
        "*.key"
        "*.srl"
        ".DS_Store"
    )

    for dir in "${directories_to_clean[@]}"
    do
        for mask in "${masks_to_remove[@]}"
        do
            echo "Removing" $dir$mask
            rm -rf $dir$mask
        done
    done
}

function generate_https_certificates {

    HTTPS_ROOT_CA_DN_S="C=${DEFAULT_C}, ST=${DEFAULT_ST}, L=${DEFAULT_L}, O=${DEFAULT_O}, OU=${DEFAULT_OU}, emailAddress=${DEFAULT_EMAIL}, CN=${DEFAULT_CN}"
    HTTPS_ROOT_CA_DN="/${HTTPS_ROOT_CA_DN_S//, //}"

    HTTPS_SERVER_DN_S="C=${DEFAULT_C}, ST=${DEFAULT_ST}, L=${DEFAULT_L}, O=${DEFAULT_O}, OU=${DEFAULT_OU}, emailAddress=${DEFAULT_EMAIL}, CN=${DEFAULT_CN}"
    HTTPS_SERVER_DN="/${HTTPS_SERVER_DN_S//, //}"

    # HTTPS root (CA) certificate
    echo "Generating HTTPS root CSR and private key"
    umask u=rw,go= && \
        openssl req \
            -new \
            -text \
            -noenc \
            -newkey $HTTPS_ALGO \
            -subj "$HTTPS_ROOT_CA_DN" \
            -keyout CA/root.key \
            -out CA/root.csr
    echo "HTTPS root CSR and private key generated"

    echo "Generating HTTPS root (CA) certificate"
    umask u=rw,go= && \
        openssl x509 \
            -req \
            -text \
            -days $DURATION_DAYS \
            -in CA/root.csr \
            -extfile <(cat /etc/ssl/openssl.cnf v3.cnf) \
            -extensions v3_https_root \
            -key CA/root.key \
            -out CA/root.crt
    echo "HTTPS root (CA) certificate generated"
    # HTTPS root certificate end

    # HTTPS server certificate
    echo "Generating HTTPS nginx server CSR and private key"
    umask u=rw,go= && \
        openssl req \
            -new \
            -text \
            -noenc \
            -newkey $HTTPS_ALGO \
            -subj "$HTTPS_SERVER_DN" \
            -keyout server/server.key \
            -out server/server.csr
    echo "HTTPS nginx server CSR and private key generated"

    echo "Generating HTTPS nginx server certificate using previously generated root certificate"
    umask u=rw,go= && \
        openssl x509 \
            -req \
            -text \
            -CAcreateserial \
            -days $DURATION_DAYS \
            -in server/server.csr \
            -extfile <(cat /etc/ssl/openssl.cnf v3.cnf) \
            -extensions v3_https_server \
            -CA CA/root.crt \
            -CAkey CA/root.key \
            -out server/server.crt
    echo "HTTPS nginx server certificate generated"
    # HTTPS server certificate end

    echo "HTTPS certificates generated"
}

function do_clean {
    echo "Cleaning up existing certificates data"
    cleanup
    echo "Existing certificates data cleaned up"
}

function do_generate {
    echo "Generating certificates..."
    generate_https_certificates
    echo "HTTPS certificates generated"
}

function show_help {
    echo "Usage: $0 [--https-algo=<algorithm>] [--duration=<days>] [--default-c=<country>] [--default-st=<state>] [--default-l=<locality>] [--default-o=<organization>] [--default-ou=<organizational unit>] [--default-email=<email>] [--default-cn=<common name>] [--skip-deletion] [--skip-generation]"
    echo "Defaults: [--https-algo=rsa:4096] [--duration=365] [--default-c=RU] [--default-st=Moscow] [--default-l=Moscow] [--default-o=Personal] [--default-ou=Personal] [--default-email=$DEFAULT_EMAIL] [--default-cn=localhost]"
}

function main {
    skip_deletion=false
    skip_generation=false
    for i in "$@"
    do
    case $i in
        --https-algo=*)
        HTTPS_ALGO="${i#*=}"
        shift
        ;;
        --duration=*)
        DURATION_DAYS="${i#*=}"
        shift
        ;;
        --default-c=*)
        DEFAULT_C="${i#*=}"
        shift
        ;;
        --default-st=*)
        DEFAULT_ST="${i#*=}"
        shift
        ;;
        --default-l=*)
        DEFAULT_L="${i#*=}"
        shift
        ;;
        --default-o=*)
        DEFAULT_O="${i#*=}"
        shift
        ;;
        --default-ou=*)
        DEFAULT_OU="${i#*=}"
        shift
        ;;
        --default-email=*)
        DEFAULT_EMAIL="${i#*=}"
        shift
        ;;
        --default-cn=*)
        DEFAULT_CN="${i#*=}"
        shift
        ;;
        --skip-deletion)
        skip_deletion=true
        shift
        ;;
        --skip-generation)
        skip_generation=true
        shift
        ;;
        --help)
        show_help
        exit 0
        ;;
        *)
        ;;
    esac
    done

    if [[ "$skip_deletion" != true ]]; then
        do_clean
    fi

    if [[ "$skip_generation" != true ]]; then
        do_generate
    fi
}

main $@
