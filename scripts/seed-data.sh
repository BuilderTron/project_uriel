#!/bin/bash

# Script to seed Firebase emulators with development data
# Usage: ./scripts/seed-data.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SEED_DATA_FILE="$PROJECT_ROOT/infra/local/seed-data.json"

echo "🌱 Seeding Firebase emulators with development data..."

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if seed data file exists
if [ ! -f "$SEED_DATA_FILE" ]; then
    echo "❌ Seed data file not found: $SEED_DATA_FILE"
    exit 1
fi

# Parse JSON and create Firestore documents
echo "📊 Creating Firestore documents..."

# Function to create documents in a collection
create_documents() {
    local collection=$1
    local documents=$(cat "$SEED_DATA_FILE" | jq -r ".${collection}[]")
    
    if [ "$documents" != "" ]; then
        echo "  Creating $collection documents..."
        echo "$documents" | jq -c '.' | while read -r doc; do
            local doc_id=$(echo "$doc" | jq -r '.id')
            if [ "$doc_id" != "null" ]; then
                # Remove the id field from the document data
                local doc_data=$(echo "$doc" | jq 'del(.id)')
                echo "    Creating $collection/$doc_id"
                # Note: This would use Firebase Admin SDK in a real implementation
                # For now, we'll output the commands that would be run
                echo "      firebase firestore:write $collection/$doc_id '$doc_data'"
            fi
        done
    fi
}

# Create documents for each collection
collections=("projects" "experience" "blog" "config")

for collection in "${collections[@]}"; do
    create_documents "$collection"
done

echo ""
echo "📝 To actually seed the data, you would need to:"
echo "  1. Start the Firebase emulators: firebase emulators:start"
echo "  2. Use the Firebase Admin SDK or REST API to create the documents"
echo "  3. Or manually create them through the Emulator UI at http://localhost:4000"
echo ""
echo "🔗 Sample documents are defined in: $SEED_DATA_FILE"
echo "✅ Seed data script completed!"

# Create a simple script to import/export emulator data
cat > "$PROJECT_ROOT/scripts/export-emulator-data.sh" << 'EOF'
#!/bin/bash

# Export Firebase emulator data
echo "📤 Exporting Firebase emulator data..."

cd "$(dirname "$0")/.."

firebase emulators:export ./infra/local/data/

echo "✅ Emulator data exported to ./infra/local/data/"
EOF

cat > "$PROJECT_ROOT/scripts/import-emulator-data.sh" << 'EOF'
#!/bin/bash

# Import Firebase emulator data
echo "📥 Importing Firebase emulator data..."

cd "$(dirname "$0")/.."

if [ -d "./infra/local/data/" ]; then
    firebase emulators:start --import=./infra/local/data/
else
    echo "❌ No data found to import. Run export-emulator-data.sh first."
    exit 1
fi
EOF

# Make scripts executable
chmod +x "$PROJECT_ROOT/scripts/export-emulator-data.sh"
chmod +x "$PROJECT_ROOT/scripts/import-emulator-data.sh"

echo "📦 Created additional scripts:"
echo "  - scripts/export-emulator-data.sh"
echo "  - scripts/import-emulator-data.sh"