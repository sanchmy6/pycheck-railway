import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete existing data first
  await prisma.problem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.example.deleteMany();

  console.log("Seeding database...");

  // Create examples
  await seedExamples();

  // Create courses
  const courses = await seedCourses();

  // Create categories
  const categories = await seedCategories(courses);

  // Create problems
  await seedProblems(categories);

  console.log("Database seeded successfully");
}

async function seedExamples() {
  // Create examples
  const example1 = await prisma.example.create({
    data: {
      name: "Example 1",
      description: "This is the first example",
    },
  });

  const example2 = await prisma.example.create({
    data: {
      name: "Example 2",
      description: "This is the second example",
    },
  });

  console.log("Created examples:", { example1, example2 });
}

async function seedCourses() {
  const course1 = await prisma.course.create({
    data: {
      name: "CNN",
      description: "Convolutional Neural Networks: Deep learning for computer vision, image recognition, and spatial data processing",
    },
  });

  const course2 = await prisma.course.create({
    data: {
      name: "ANN",
      description: "Artificial Neural Networks: Fundamentals of neural network architectures, backpropagation, and machine learning",
    },
  });

  console.log("Created courses:", { course1, course2 });

  return { course1, course2 };
}

async function seedCategories(courses: any) {
  const { course1, course2 } = courses

  // Create categories for CNN course
  const category1 = await prisma.category.create({
    data: {
      name: "Lecture 1: Introduction to Convolutional Layers",
      courseId: course1.id,
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: "Lecture 2: Pooling and Feature Maps",
      courseId: course1.id,
    },
  });

  // Create categories for ANN course
  const category3 = await prisma.category.create({
    data: {
      name: "Lecture 1: Neural Network Fundamentals",
      courseId: course2.id,
    },
  });

  const category4 = await prisma.category.create({
    data: {
      name: "Lecture 2: Backpropagation Algorithm",
      courseId: course2.id,
    },
  });

  console.log("Created categories:", { category1, category2, category3, category4 });

  return { category1, category2, category3, category4 };
}

async function seedProblems(categories: any) {
  const { category1, category2, category3, category4 } = categories;

  // Create problems
  const problem1 = await prisma.problem.create({
    data: {
      name: "Calculate Average",
      description: "Find the errors in this function that calculates the average of a list of numbers.",
      categoryId: category1.id,
      code_snippet: `def calculate_average(numbers):
  total = 0
  count = 0
  
  for num in numbers:
    total = num
    count += 1
    
  if count == 0:
    return 0
    
  average = total * count
  return average`,
      correct_lines: "6,11",
      reason: {
        "6": "Error: Using assignment (=) instead of addition (+=). This overwrites the total instead of adding to it.",
        "11": "Error: Using multiplication (*) instead of division (/). This calculates the product instead of the average."
      },
      hint: "Look for lines that incorrectly handle the total sum and the final calculation.",
    },
  });

  const problem2 = await prisma.problem.create({
    data: {
      name: "Find Maximum Value",
      description: "Identify the errors in this function that finds the maximum value in a list.",
      categoryId: category2.id,
      code_snippet: `def find_maximum(numbers):
  if not numbers:
    return 0
    
  maximum = 0
  
  for num in numbers:
    if num < maximum:
      maximum = num
      
  return maximum`,
      correct_lines: "3,5,8",
      reason: {
        "3": "Error: Returning 0 for empty list instead of None. This could be misleading as 0 might be a valid maximum.",
        "5": "Error: Initializing maximum to 0 instead of numbers[0]. This fails for lists with all negative numbers.",
        "8": "Error: Using less than (<) instead of greater than (>). This finds the minimum instead of the maximum."
      },
      hint: "Look for lines that incorrectly handle edge cases, initialization, and comparison logic.",
    },
  });

  const bubbleSortProblem = await prisma.problem.create({
    data: {
      name: "Bubble Sort",
      description: "Implementation of the bubble sort algorithm.",
      categoryId: category1.id,
      code_snippet: `def bubble_sort(arr):
  n = len(arr)

  for i in range(n):
      swapped = False
      
      for j in range(0, n-i-1):
          if arr[j] > arr[j+1]:
              arr[j], arr[j+1] = arr[j+1], arr[j]
              swapped = True
              
      if not swapped:
          break
          
  return arr

  # Example usage
  arr = [64, 34, 25, 12, 22, 11, 90]
  sorted_arr = bubble_sort(arr)
  print("Sorted array:", sorted_arr)`,
      correct_lines: "11,12",
      reason: {
        "11": "This is the key comparison in bubble sort that determines whether two adjacent elements need to be swapped. It compares each element with the next one and swaps them if they're in the wrong order.",
        "12": "Second reason",
      },
      hint: "Look for the line that compares adjacent elements to determine their order.",
    },
  });

  // Create problems for ANN course
  const neuronProblem = await prisma.problem.create({
    data: {
      name: "Simple Neuron Implementation",
      description: "Find the errors in this basic neuron implementation with weighted inputs and bias.",
      categoryId: category3.id,
      code_snippet: `import numpy as np

def neuron_output(inputs, weights, bias):
    # Calculate weighted sum
    weighted_sum = 0
    for i in range(len(inputs)):
        weighted_sum -= inputs[i] * weights[i]
    
    # Add bias
    weighted_sum + bias
    
    # Apply activation function (sigmoid)
    output = 1 / (1 + np.exp(weighted_sum))
    return output`,
      correct_lines: "7,10,13",
      reason: {
        "7": "Error: Using subtraction (-=) instead of addition (+=). This subtracts the weighted inputs instead of adding them.",
        "10": "Error: Missing assignment operator. Should be 'weighted_sum += bias' to actually add the bias to the sum.",
        "13": "Error: Missing negative sign in exponential. Should be 'np.exp(-weighted_sum)' for correct sigmoid function."
      },
      hint: "Look for errors in the weighted sum calculation, bias addition, and sigmoid activation function.",
    },
  });

  const backpropProblem = await prisma.problem.create({
    data: {
      name: "Gradient Descent Update",
      description: "Identify the errors in this gradient descent weight update implementation.",
      categoryId: category4.id,
      code_snippet: `def update_weights(weights, gradients, learning_rate):
    updated_weights = []
    
    for i in range(len(weights)):
        # Update rule: w = w - learning_rate * gradient
        new_weight = weights[i] + learning_rate * gradients[i]
        updated_weights.append(new_weight)
    
    return updated_weights

def calculate_loss_gradient(predicted, actual):
    # Mean squared error gradient
    gradient = 2 * (actual - predicted)
    return gradient`,
      correct_lines: "6,13",
      reason: {
        "6": "Error: Using addition (+) instead of subtraction (-). Gradient descent should subtract the gradient: w = w - learning_rate * gradient.",
        "13": "Error: Incorrect gradient calculation. For MSE, gradient should be 2 * (predicted - actual), not (actual - predicted)."
      },
      hint: "Check the gradient descent update rule and the derivative of mean squared error loss function.",
    },
  });

  const activationProblem = await prisma.problem.create({
    data: {
      name: "Activation Functions",
      description: "Find the errors in these common neural network activation function implementations.",
      categoryId: category3.id,
      code_snippet: `import numpy as np

def relu(x):
    return np.minimum(0, x)

def tanh(x):
    return (np.exp(x) + np.exp(-x)) / (np.exp(x) - np.exp(-x))

def softmax(x):
    exp_x = np.exp(x)
    return exp_x / np.sum(exp_x)`,
      correct_lines: "4,7",
      reason: {
        "4": "Error: Using np.minimum instead of np.maximum. ReLU should return max(0, x), not min(0, x).",
        "7": "Error: Incorrect tanh formula. Should be (exp(x) - exp(-x)) / (exp(x) + exp(-x)), with subtraction in numerator and addition in denominator."
      },
      hint: "Check the mathematical definitions of ReLU and tanh activation functions.",
    },
  });

  console.log("Created problems:", { problem1, problem2, bubbleSortProblem, neuronProblem, backpropProblem, activationProblem });
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 