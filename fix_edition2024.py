import subprocess, re, urllib.request, json

def parse_version(v):
    # Simple semantic version parser for sorting
    parts = re.split(r'[-.]', v)
    return [int(x) if x.isdigit() else x for x in parts]

def run_build():
    result = subprocess.run(["cargo-build-sbf", "build-sbf"], capture_output=True, text=True)
    return result.stderr

while True:
    stderr = run_build()
    match = re.search(r"failed to parse manifest at .*?([a-zA-Z0-9_-]+)-([0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?)/Cargo\.toml.*?edition2024", stderr, re.DOTALL)
    
    if not match:
        print("No edition2024 errors found or build completed.")
        if "error:" in stderr:
            print("Remaining errors:")
            print(stderr)
        break
        
    crate = match.group(1)
    bad_version = match.group(2)
    print(f"Detected Edition 2024 failure on: {crate} v{bad_version}")
    
    req = urllib.request.Request(f"https://crates.io/api/v1/crates/{crate}", headers={'User-Agent': 'solana-fixer/1.0'})
    try:
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode())
        versions = [v['num'] for v in data['versions'] if not v['yanked']]
        
        # Sort and find highest version less than bad_version
        versions.sort(key=parse_version, reverse=True)
        good_version = None
        for v in versions:
            if parse_version(v) < parse_version(bad_version):
                good_version = v
                break
                
        if good_version:
            print(f"Downgrading to {good_version}...")
            subprocess.run(["cargo", "update", "-p", f"{crate}@{bad_version}", "--precise", good_version])
        else:
            print("No valid downgrade version found.")
            break
            
    except Exception as e:
        print(f"Error fetching versions: {e}")
        break
