require 'rails_helper'

RSpec.describe Task, type: :model do
  # Assign simulated model objects
  let(:created_by) { User.new(name: "John", email: "john@test.com", active: true, level: 0)}
  let(:category) { Category.new(name: "Test Category 1")}
  # Create Sample data
  subject { described_class.new(name: "Test task", category: category, created_by: created_by, due_date: DateTime.now + 1.week, completion_date: DateTime.now, time_taken: 2.5) }
  # Create method tests
  describe '.create!' do
    it "is valid with valid attributes" do
      expect(subject).to be_valid
    end
    it "is not valid without a user" do
      subject.created_by = nil
      expect(subject).to_not be_valid
    end
    it "is not valid without a category" do
      subject.category = nil
      expect(subject).to_not be_valid
    end
  end
  # Complete method tests
  describe '.update!' do
    it "if completed date given must also have time taken" do
      subject.time_taken = nil
      expect(subject).to_not be_valid
    end
  end
  # Each task should have a corresponding user entry who created it and a referenced category
  describe "Associations" do
    it { should belong_to(:created_by) }
    it { should belong_to(:category) }
  end
end