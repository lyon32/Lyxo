import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface AuthTextInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

// Input 56px, surface #1E1B1A (input token), toggle œil pour les champs
// mot de passe (UI prompt écran 3).
export function AuthTextInput({ label, error, isPassword, ...rest }: AuthTextInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="gap-1">
      <View className="h-14 flex-row items-center rounded-2xl bg-input px-4">
        <TextInput
          {...rest}
          placeholder={label}
          placeholderTextColor="#8E8781"
          secureTextEntry={isPassword && !visible}
          className="flex-1 text-fg"
        />
        {isPassword ? (
          <Pressable onPress={() => setVisible((v) => !v)}>
            {visible ? (
              <EyeOff color="#8E8781" size={20} />
            ) : (
              <Eye color="#8E8781" size={20} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="text-fg">{error}</Text> : null}
    </View>
  );
}
