#!/bin/bash

echo "🧪 Running Design System Sync Test Suite"
echo "=============================================="
echo ""

# Run all tests with coverage
npm run test:coverage

# Check exit code
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ All tests passed!"
  exit 0
else
  echo ""
  echo "❌ Some tests failed!"
  exit 1
fi
