from __future__ import annotations

import platform
import shlex
import subprocess
import sys
from pathlib import Path


PROJECT_DIR = Path(__file__).resolve().parent
ANDROID_DIR = PROJECT_DIR / "android"
OUTPUT_DIR = PROJECT_DIR / "dist"
OUTPUT_APK = OUTPUT_DIR / "ScholarverseDashboard-Android-debug.apk"


def decode_output(output: bytes | None) -> str:
    if not output:
        return ""
    if b"\x00" in output:
        try:
            return output.decode("utf-16-le").rstrip("\x00")
        except UnicodeDecodeError:
            pass
    return output.decode("utf-8", errors="replace")


def run_wsl(
    *arguments: str,
    check: bool = True,
    timeout: int | None = None,
) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        ["wsl.exe", *arguments],
        check=False,
        stdin=subprocess.DEVNULL,
        capture_output=True,
        timeout=timeout,
    )
    completed = subprocess.CompletedProcess(
        result.args,
        result.returncode,
        decode_output(result.stdout),
        decode_output(result.stderr),
    )
    if check and completed.returncode:
        raise subprocess.CalledProcessError(
            completed.returncode,
            completed.args,
            output=completed.stdout,
            stderr=completed.stderr,
        )
    return completed


def to_wsl_path(path: Path) -> str:
    result = run_wsl("wslpath", "-a", str(path))
    return result.stdout.strip()


def main() -> int:
    if platform.system() != "Windows":
        print("Run this launcher from Windows; it builds the APK inside WSL.", file=sys.stderr)
        return 2
    if not ANDROID_DIR.joinpath("buildozer.spec").is_file():
        print(f"Android project files are missing from {ANDROID_DIR}.", file=sys.stderr)
        return 2

    try:
        status = run_wsl("--status", check=False, timeout=20)
        if status.returncode:
            details = "\n".join(
                output.strip() for output in (status.stderr, status.stdout) if output.strip()
            )
            print(
                "WSL could not start, so the APK was not built. Repair or finish updating "
                "your WSL installation, then rerun this script."
                + (f"\n{details}" if details else ""),
                file=sys.stderr,
            )
            return 2
        source = to_wsl_path(ANDROID_DIR)
        destination = to_wsl_path(OUTPUT_DIR)
        build_dir = '"$HOME/scholarverse-dashboard-android"'
        shell_script = (
            "set -eu; "
            'export PATH="$HOME/.venvs/buildozer/bin:$HOME/.local/bin:$PATH"; '
            "if ! command -v buildozer >/dev/null 2>&1; then "
            "echo 'Buildozer is not installed in WSL. See desktop-dashboard/README.md.' >&2; "
            "exit 127; fi; "
            f"build_dir={build_dir}; "
            'mkdir -p "$build_dir/project" "$build_dir/output" '
            f"{shlex.quote(destination)}; "
            f"cp -a {shlex.quote(source)}/. \"$build_dir/project/\"; "
            'cd "$build_dir/project"; '
            "buildozer android debug; "
            "apk=$(find bin -maxdepth 1 -type f -name '*.apk' -print -quit); "
            'if [ -z "$apk" ]; then echo "Buildozer completed without producing an APK." >&2; exit 1; fi; '
            f"cp \"$apk\" {shlex.quote(destination + '/ScholarverseDashboard-Android-debug.apk')}; "
            f"printf 'APK copied to %s\\n' {shlex.quote(destination + '/ScholarverseDashboard-Android-debug.apk')}"
        )
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        result = run_wsl("bash", "-lc", shell_script, check=False)
        if result.stdout:
            print(result.stdout, end="")
        if result.stderr:
            print(result.stderr, end="", file=sys.stderr)
        if result.returncode:
            return result.returncode
    except FileNotFoundError:
        print(
            "WSL was not found. Install WSL with an Ubuntu distribution, then install "
            "Buildozer there.",
            file=sys.stderr,
        )
        return 2
    except subprocess.TimeoutExpired:
        print(
            "WSL did not respond within 20 seconds. Repair or initialize the WSL "
            "distribution, then rerun this script.",
            file=sys.stderr,
        )
        return 2
    except subprocess.CalledProcessError as error:
        print(
            error.stderr
            or "Could not run a WSL command. Install WSL with Ubuntu "
            "(for example, `wsl --install -d Ubuntu`) and initialize the distribution.",
            file=sys.stderr,
        )
        return error.returncode or 1

    print(f"Build complete: {OUTPUT_APK}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
