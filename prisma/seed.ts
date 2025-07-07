import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete existing data first
  await prisma.problem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.course.deleteMany();

  console.log("Seeding database...");

  // Create courses
  const courses = await seedCourses();

  // Create categories
  const categories = await seedCategories(courses);

  // Create problems
  await seedProblems(categories);

  console.log("Database seeded successfully");
}

async function seedCourses() {
  const course1 = await prisma.course.create({
    data: {
      name: "CNN",
      description: "Convolutional Neural Networks: Deep learning for computer vision, image recognition, and spatial data processing",
      status: "Active",
    },
  });

  const course2 = await prisma.course.create({
    data: {
      name: "ANN",
      description: "Artificial Neural Networks: Fundamentals of neural network architectures, backpropagation, and machine learning",
      status: "Active",
    },
  });

  // Create additional courses with different statuses
  const course3 = await prisma.course.create({
    data: {
      name: "RNN",
      description: "Recurrent Neural Networks: Sequential data processing, LSTM, GRU, and time series analysis",
      status: "Private",
    },
  });

  const course4 = await prisma.course.create({
    data: {
      name: "Deep Learning Fundamentals",
      description: "Introduction to deep learning concepts, architectures, and applications - archived for reference",
      status: "Archived",
    },
  });

  console.log("Created courses:", { course1, course2, course3, course4 });

  return { course1, course2, course3, course4 };
}

async function seedCategories(courses: any) {
  const { course1, course2, course3, course4 } = courses

  // Create categories for CNN course (Active)
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

  // Create categories for ANN course (Active)
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

  // Create categories for RNN course (Private)
  const category5 = await prisma.category.create({
    data: {
      name: "Lecture 1: RNN Basics and Applications",
      courseId: course3.id,
    },
  });

  const category6 = await prisma.category.create({
    data: {
      name: "Lecture 2: LSTM and GRU Networks",
      courseId: course3.id,
    },
  });

  // Create categories for Deep Learning Fundamentals course (Archived)
  const category7 = await prisma.category.create({
    data: {
      name: "Lecture 1: Introduction to Deep Learning",
      courseId: course4.id,
    },
  });

  const category8 = await prisma.category.create({
    data: {
      name: "Lecture 2: Neural Network Architectures",
      courseId: course4.id,
    },
  });

  console.log("Created categories:", { category1, category2, category3, category4, category5, category6, category7, category8 });

  return { category1, category2, category3, category4, category5, category6, category7, category8 };
}

async function seedProblems(categories: any) {
  const { category1, category2, category3, category4, category5, category6, category7, category8 } = categories;

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

  // Create problems for RNN course (Private)
  const rnnProblem = await prisma.problem.create({
    data: {
      name: "Simple RNN Implementation",
      description: "Find the errors in this basic RNN cell implementation for sequence processing.",
      categoryId: category5.id,
      code_snippet: `import numpy as np

def rnn_cell(input_t, hidden_t_minus_1, W_input, W_hidden, bias):
    # Compute hidden state
    hidden_t = np.tanh(W_input @ input_t + W_hidden @ hidden_t_minus_1 + bias)
    
    # Output is the same as hidden state in simple RNN
    output_t = hidden_t
    
    return output_t, hidden_t

def rnn_forward(inputs, initial_hidden, W_input, W_hidden, bias):
    hidden_states = []
    outputs = []
    
    hidden_t = initial_hidden
    
    for t in range(len(inputs)):
        output_t, hidden_t = rnn_cell(inputs[t], hidden_t, W_input, W_hidden, bias)
        outputs.append(output_t)
        hidden_states.append(hidden_t)
    
    return outputs, hidden_states`,
      correct_lines: "",
      reason: {},
      hint: "This is a correct implementation of a simple RNN. Look for proper matrix operations and state propagation.",
    },
  });

  const lstmProblem = await prisma.problem.create({
    data: {
      name: "LSTM Gates",
      description: "Identify the errors in this LSTM gate implementation.",
      categoryId: category6.id,
      code_snippet: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def lstm_cell(input_t, hidden_t_minus_1, cell_t_minus_1, W_f, W_i, W_o, W_g, b_f, b_i, b_o, b_g):
    # Forget gate
    forget_gate = sigmoid(W_f @ input_t + W_f @ hidden_t_minus_1 + b_f)
    
    # Input gate
    input_gate = sigmoid(W_i @ input_t + W_i @ hidden_t_minus_1 + b_i)
    
    # Candidate values
    candidate = np.tanh(W_g @ input_t + W_g @ hidden_t_minus_1 + b_g)
    
    # Cell state
    cell_t = forget_gate * cell_t_minus_1 + input_gate + candidate
    
    # Output gate
    output_gate = sigmoid(W_o @ input_t + W_o @ hidden_t_minus_1 + b_o)
    
    # Hidden state
    hidden_t = output_gate * np.tanh(cell_t)
    
    return hidden_t, cell_t`,
      correct_lines: "8,11,16",
      reason: {
        "8": "Error: Using W_f twice. Should use different weight matrices: W_f @ input_t + U_f @ hidden_t_minus_1 + b_f",
        "11": "Error: Using W_i twice. Should use different weight matrices: W_i @ input_t + U_i @ hidden_t_minus_1 + b_i",
        "16": "Error: Missing multiplication for candidate. Should be: forget_gate * cell_t_minus_1 + input_gate * candidate"
      },
      hint: "Check the LSTM gate equations and ensure proper weight matrices and operations are used.",
    },
  });

  // Create problems for Deep Learning Fundamentals course (Archived)
  const gradientProblem = await prisma.problem.create({
    data: {
      name: "Gradient Calculation",
      description: "Find the errors in this basic gradient calculation for a simple neural network.",
      categoryId: category7.id,
      code_snippet: `import numpy as np

def forward_pass(x, w1, b1, w2, b2):
    # First layer
    z1 = np.dot(x, w1) + b1
    a1 = 1 / (1 + np.exp(-z1))  # sigmoid
    
    # Second layer
    z2 = np.dot(a1, w2) + b2
    a2 = 1 / (1 + np.exp(-z2))  # sigmoid
    
    return a2, a1, z1, z2

def backward_pass(x, y, a2, a1, z1, z2, w2):
    # Output layer gradient
    dz2 = a2 - y
    dw2 = np.dot(a1.T, dz2)
    db2 = np.sum(dz2, axis=0, keepdims=True)
    
    # Hidden layer gradient
    da1 = np.dot(dz2, w2.T)
    dz1 = da1 * a1 * (1 + a1)  # sigmoid derivative
    
    return dz1, dw2, db2`,
      correct_lines: "22",
      reason: {
        "22": "Error: Incorrect sigmoid derivative. Should be a1 * (1 - a1), not a1 * (1 + a1)."
      },
      hint: "Check the derivative of the sigmoid activation function.",
    },
  });

  const optimizationProblem = await prisma.problem.create({
    data: {
      name: "Learning Rate Scheduling",
      description: "Find the errors in this learning rate scheduling implementation.",
      categoryId: category8.id,
      code_snippet: `def exponential_decay(initial_lr, decay_rate, step):
    return initial_lr * (decay_rate ** step)

def step_decay(initial_lr, drop_rate, epochs_drop, epoch):
    return initial_lr * (drop_rate ** (epoch // epochs_drop))

def cosine_annealing(initial_lr, T_max, epoch):
    import math
    return initial_lr * (1 - math.cos(math.pi * epoch / T_max)) / 2

def polynomial_decay(initial_lr, decay_steps, power, step):
    return initial_lr * (1 + step / decay_steps) ** (-power)`,
      correct_lines: "9,12",
      reason: {
        "9": "Error: Incorrect cosine annealing formula. Should be: initial_lr * (1 + math.cos(math.pi * epoch / T_max)) / 2",
        "12": "Error: Incorrect polynomial decay formula. Should be: initial_lr * (1 - step / decay_steps) ** power"
      },
      hint: "Check the mathematical formulas for cosine annealing and polynomial decay scheduling.",
    },
  });

  console.log("Created problems:", { problem1, problem2, bubbleSortProblem, neuronProblem, backpropProblem, activationProblem, rnnProblem, lstmProblem, gradientProblem, optimizationProblem });
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 