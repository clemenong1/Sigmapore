import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const CustomButton = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    icon = null,
    style = {},
    textStyle = {}
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                disabled && styles.disabledButton,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator size="small" color="#666" />
            ) : (
                <Text style={[styles.buttonText, textStyle]}>
                    {icon && (
                        <FontAwesome5
                            name={icon}
                            size={16}
                            color={textStyle.color || "#666"}
                            solid
                        />
                    )}
                    {icon ? ` ${title}` : title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default CustomButton; 