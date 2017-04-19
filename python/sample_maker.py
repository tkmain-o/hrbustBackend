import mnist_prediction as mp
import image_filter as ifi
import os
from PIL import Image
import sys
import numpy as np
# from scipy.misc import toimage

# def make_sample(digits):
#     i = 0
#     for digit in digits:
#         # print(digit.shape)
#         path = 'test_sample/' + str(i) + '.bmp'
#         i += 1
#         digit = digit.reshape(10, 13)
#         # c_digit = np.multiply(digit, 255)
#         # print(digits)
#         toimage(digit).show()
#         img_new = Image.fromarray(c_digit).convert('L')
#         # img_new.show()
#         img_new.save(path)
#     print("Digits saved.")
#     return True

def analyze_picture(folder_path):
    # print(os.getcwd())
    # os.chdir(folder_path)
    # flag = False
    path = os.getcwd() + '/' + folder_path
    # print(path)
    for file_name in os.listdir(folder_path):
        if not file_name.endswith('.jpg'):
            continue
        print("Picture in processing: ", file_name)
        # if not flag:
        #     os.chdir(folder_path)
        #     flag = True
        # print(os.getcwd())
        # print(file_name)
        file_path = path + '/' + file_name
        digits, pred = ifi.picture_loader(file_path)
        if not pred:
            print("沾粘")
            continue
        else:
            Image.open(file_path).show()
            prediction = mp.picture_prediction(digits)
            sys.stdout.write("The number of the picture is " + str(prediction) + " [y/n] ")
            choice = input().lower()
            # print(choice == "y", choice == 'y', str(choice) == 'y', str(choice) == "y")
            if choice == 'y':
                continue
            else:
                # print("n")
                if not os.path.exists('test_sample'):
                    os.makedirs('test_sample')
                img = Image.open(file_path).convert('L')
                img_arr = np.array(img).astype(np.float32)
                for (x, y), value in np.ndenumerate(img_arr):
                    if value < 100:
                        img_arr[x][y] = 0
                    else:
                        img_arr[x][y] = 255
                ifi.get_area_width_and_save(img_arr)
            # print(choice)
    # os.chdir()
    return True

