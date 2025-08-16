#!/usr/bin/env python3
"""
Test Runner Script for Task Management System
Run this script to execute all tests with coverage
"""

import subprocess
import sys
import os

def run_tests():
    """Run the test suite with coverage"""
    print("🧪 Running Task Management System Tests...")
    print("=" * 50)
    
    # Check if virtual environment is activated
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Virtual environment not detected!")
        print("   Please activate your virtual environment first:")
        print("   source venv/bin/activate")
        print()
    
    try:
        # Run tests with coverage
        print("📊 Running tests with coverage...")
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "tests/", 
            "-v", 
            "--cov=app", 
            "--cov-report=term-missing",
            "--cov-report=html"
        ], capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print("Warnings/Errors:")
            print(result.stderr)
        
        print("=" * 50)
        if result.returncode == 0:
            print("✅ All tests passed successfully!")
            print("📁 Coverage report generated in htmlcov/ directory")
            print("🌐 Open htmlcov/index.html in your browser to view coverage")
        else:
            print("❌ Some tests failed!")
            sys.exit(1)
            
    except FileNotFoundError:
        print("❌ Error: pytest not found!")
        print("   Please install pytest: pip install pytest pytest-cov")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_tests() 